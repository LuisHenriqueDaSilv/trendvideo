from smtplib import SMTP
from dotenv import dotenv_values


#Geting dotenv variables
dotenv_variables = dotenv_values('.env')
SERVER_EMAIL = dotenv_variables.get('SERVER_EMAIL')
SERVER_EMAIL_PASSWORD = dotenv_variables.get('SERVER_EMAIL_PASSWORD')
SERVER_EMAIL_HOST = dotenv_variables.get('SERVER_EMAIL_HOST')
SERVER_EMAIL_PORT = dotenv_variables.get('SERVER_EMAIL_PORT')


if not SERVER_EMAIL or not SERVER_EMAIL_PASSWORD \
    or not SERVER_EMAIL_HOST or not SERVER_EMAIL_PORT:
        raise Exception('Configure .env file with all emails configs')

#Configure smtp server
smtp_server = SMTP(host=SERVER_EMAIL_HOST, port=SERVER_EMAIL_PORT)
smtp_server.ehlo()
smtp_server.starttls()
smtp_server.login(user=SERVER_EMAIL, password=SERVER_EMAIL_PASSWORD)