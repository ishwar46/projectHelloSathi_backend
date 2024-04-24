import openai
from dotenv import find_dotenv, load_dotenv
import logging
import time
from datetime import datetime

# Load environment variables
load_dotenv()

client = openai.OpenAI()
model = "gpt-3.5-turbo-16k"

# #Creating an assistant
# hello_sathi_assis = client.beta.assistants.create(
#     name="Hello Sathi",
#     instructions="""You are a helpful personal ai assistant. 
#     You give recommendations and knowledge to IT students and you mainly focus in Business domain knowledge.""",
#     model=model
# )

# assistant_id = hello_sathi_assis.id

# print(assistant_id)



#Thread 
# thread = client.beta.threads.create(
#     messages=[
#         {
#             "role": "user",
#             "content" : "How can i gain more knowledge about business domain being an IT student?"
#         }
#     ]
# )
# thread_id = thread.id
# print(thread_id)

#Hardcoded ID for now
assistant_id = "asst_EcXJKgkkZeIGg1YBxoVTfVhb"
thread_id =  "thread_9seCqLCKYaSuG8kqXaBD7l76"

# ==== Create a Message ====
message = "What are the best business books for undergraduate IT students?"
message = client.beta.threads.messages.create(
    thread_id=thread_id, 
    role="user", 
    content=message
)



#run our assistant
run = client.beta.threads.runs.create(
    thread=thread_id,
    assistant=assistant_id,
    instructions= "Please address the user as undergraduate IT student"
)


#Helper function
def wait_for_run_completion(client, thread_id, run_id, sleep_interval=5):
    """

    Waits for a run to complete and prints the elapsed time.:param client: The OpenAI client object.
    :param thread_id: The ID of the thread.
    :param run_id: The ID of the run.
    :param sleep_interval: Time in seconds to wait between checks.
    """
    while True:
        try:
            run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
            if run.completed_at:
                elapsed_time = run.completed_at - run.created_at
                formatted_elapsed_time = time.strftime(
                    "%H:%M:%S", time.gmtime(elapsed_time)
                )
                print(f"Run completed in {formatted_elapsed_time}")
                logging.info(f"Run completed in {formatted_elapsed_time}")
                # Get messages here once Run is completed!
                messages = client.beta.threads.messages.list(thread_id=thread_id)
                last_message = messages.data[0]
                response = last_message.content[0].text.value
                print(f"Assistant Response: {response}")
                break
        except Exception as e:
            logging.error(f"An error occurred while retrieving the run: {e}")
            break
        logging.info("Waiting for run to complete...")
        time.sleep(sleep_interval)
        
# Run
wait_for_run_completion(client=client, thread_id=thread_id, run_id=run.id)



