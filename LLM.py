import os 
import psycopg
from dotenv import load_dotenv
import aiohttp
import asyncio
import json



def get_pending_entries(limit: int | None = None):
    """
    Connect to Neon and fetch rows with status PENDING
    """

    load_dotenv()
    CONN_STRING = os.getenv('DATABASE_URL')
    if not CONN_STRING: 
        raise RuntimeError("DATABASE_URL not found in environment variables.")
    
    sql = """
        SELECT id, status, title, link, summary, date_published, source, date_added
        FROM articles
        WHERE status = 'PENDING'
        ORDER BY date_published ASC
    """
    if limit is not None:
        sql += ' LIMIT %s'


    with psycopg.connect(CONN_STRING) as conn:
        with conn.cursor() as cursor:
            if limit is not None:
                cursor.execute(sql, (limit,))
            else:
                cursor.execute(sql)
            rows = cursor.fetchall()
    return rows

    ## - - - - - output example 'rows'  - - - - -
    # id, status, title, link, summary, date_published, source, date_added
    #
    # [
    # (1, "PENDING", "NOS article title", "https://...", "...summary...", "2025-11-06 ...", "NOS", "2025-11-06 ..."),
    # (2, "PENDING", "Another article", "https://...", "...", None, "NOS", "2025-11-06 ...")
    # ]


async def classify_article(session, title: str, summary: str, api_key: str):
    """
    Sends a single article to Chutes LLM for classification
    Returns the classiciation result and explanation
    """

    url = "https://llm.chutes.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "deepseek-ai/DeepSeek-R1",
        "messages": [
                    {
                        "role": "user",
                        "content": f"""Analyze this news article for JUMBO Supermarkten (a major Dutch supermarket chain).
                        Title: {title}
                        Summary: {summary}
                        Classify this article as either:
                        - Threat: Could negatively impact JUMBO's business, reputation, or operations
                        - Opportunity: Could benefit JUMBO or presents a business opportunity
                        - Neutral: No significant impact on JUMBO
                        Provide your response in the following format:
                        Classification: [Threat/Opportunity/Neutral]
                        Explanation: [Brief explanation of why this matters or doesn't matter to JUMBO]"""
            }
        ],
        "stream" : False,
        "max_tokens": 2048,
        "temperature": 0.5
    }

    try:
        async with session.post(url, headers=headers, json=body) as response:
            response.raise_for_status()
            data = await response.json()
            content = data['choices'][0]['message']['content']
            reasoning = data['choices'][0]['message'].get("reasoning_content")
            finish_reason = data['choices'][0].get('finish_reason')
            return content, reasoning, finish_reason
    except aiohttp.ClientError as e:
        print(f"API Request failed: {e}")
        return None
    except Exception as e: 
        print(f"Unexpected error during classification: {e}")
        return None


def parse_llm_response(response: str):
    """
    Parse the LLM response to extract classification and explanation
    returns typle: (classification, explanation)"""

    if not response: 
        return None, None
    
    lines = response.strip().split('\n')
    classification = None
    explanation = None

    for line in lines:
        if line.startswith("Classification:"):
            classification = line.replace("Classification:", "").strip()
        elif line.startswith("Explanation:"):
            explanation = line.replace("Explanation:", "").strip()

    
    # Validate Classification
    valid_classifications = {'Threat', 'Opportunity', 'Neutral'}
    if classification not in valid_classifications:
        classification = "Error: Unknown"
    
    if not explanation:
        explanation = response

    return classification, explanation
 

def update_database(article_id: int, classification: str, explanation: str, reasoning: str, status: str = 'CLASSIFIED'):
    """
    Update the article in the database with classification results
    """

    load_dotenv()
    CONN_STRING = os.getenv('DATABASE_URL')
    if not CONN_STRING:
        raise RuntimeError("DATABASE_URL not found in environment variables.")
    
    sql = """
        UPDATE articles
        SET classification = %s, explanation = %s, reasoning = %s, status = %s
        WHERE id = %s
    """

    try:
        with psycopg.connect(CONN_STRING) as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, (classification, explanation, reasoning, status, article_id))
        return True
    except Exception as e:
        print(f"Failed to update article ID {article_id}: {e}")
        return False
    

async def main():
    """
    Main function - fetches new articles from database and classifies them 
    """

    # Load the API KEY from the environment variables
    load_dotenv()
    CHUTES_API_KEY = os.getenv('CHUTES_API_KEY')
    if not CHUTES_API_KEY:
        raise RuntimeError("CHUTES_API_KEY not found in environment variables.")


    # From the database get new entries with status PENDING
    new_entries = get_pending_entries()
    if new_entries:
        print(f'Fetched {len(new_entries)} entries with status "PENDING"')
    else: 
        print('No new entries with status "PENDING" found.')
        return


    sucessful = 0
    failed = 0
    counter = 1

    # For each new entry, we sent the entry to the LLM for classification
    async with aiohttp.ClientSession() as session:
        for entry in new_entries: 
            article_id = entry[0]
            title = entry[2]
            summary = entry[4]  
            print(f'Processing article {counter} of {len(new_entries)}   (ID): {article_id}: {title[:30]} ...')
            counter += 1

            result = await classify_article(session, title, summary, CHUTES_API_KEY)
            
            if result:
                llm_response_content, llm_response_reasoning, finish_reason = result
                if finish_reason == 'length':
                     print(f"⚠️ Warning: Response was cut off due to token limit")

                classification, explanation = parse_llm_response(llm_response_content)

                if classification and explanation: 
                    succes = update_database(
                        article_id, 
                        classification, 
                        explanation, 
                        llm_response_reasoning or ""
                    )


                    if succes:
                        print(f'✓ Classified as: {classification}\n')
                        sucessful += 1
                    else:
                        print(f"✗ Failed to update database\n")
                        failed += 1
                
                else:
                    print(f"✗ Failed to parse LLM response\n")
                    update_database(
                        article_id, 
                        None, 
                        None, 
                        None, 
                        status='FAILED (to parse response)'
                    )
                    failed += 1
            
            else:
                print(f"✗ Failed to get LLM response\n")
                update_database(
                    article_id, 
                    None, 
                    None, 
                    None, 
                    status='FAILED (no response)'
                )
                failed += 1

    print()
    print(f"=== Processing complete ===")
    print(f"Successful: {sucessful}")
    print(f"Failed: {failed}")
    



    




if __name__ == "__main__":
    asyncio.run(main())