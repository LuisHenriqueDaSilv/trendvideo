import dotenv

from app import app

dotenv_variables = dotenv.dotenv_values()
PORT=dotenv_variables.get('PORT')

if not PORT:
    PORT = 3000

if __name__ == "__main__":
    app.run(port=PORT)
