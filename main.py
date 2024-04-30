import openai
import os
from dotenv import load_dotenv
import logging
import time


logging.basicConfig(level=logging.INFO)


load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
if api_key is None:
    raise ValueError("API key not found. Ensure your .env file is configured correctly.")

client = openai.OpenAI(api_key=api_key)

model = "gpt-4-turbo"


assistant_id = "asst_4BysHXd3fxkFgosh5Gimqi9g"
thread_id = "thread_9seCqLCKYaSuG8kqXaBD7l76"


message_content = "What are the best business books for undergraduate IT students?"
response = client.beta.threads.messages.create(
    thread_id=thread_id,
    role="user",
    content=message_content
)

run = client.beta.threads.runs.create(
    thread_id=thread_id,
    assistant_id=assistant_id,
    instructions="Please address the user as an undergraduate IT student"
)

def wait_for_run_completion(client, thread_id, run_id, sleep_interval=5):
    while True:
        try:
            run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
            if run.completed_at:
                elapsed_time = (run.completed_at - run.created_at).total_seconds()
                formatted_elapsed_time = time.strftime("%H:%M:%S", time.gmtime(elapsed_time))
                logging.info(f"Run completed in {formatted_elapsed_time}")
                # Get messages here once Run is completed!
                messages = client.beta.threads.messages.list(thread_id=thread_id)
                last_message = messages.data[-1]  
                response = last_message.content.text.value if last_message.content.text else "No text found"
                print(f"Assistant Response: {response}")
                break
        except Exception as e:
            logging.error(f"An error occurred while retrieving the run: {e}")
            break
        time.sleep(sleep_interval)

wait_for_run_completion(client, thread_id, run.id)

