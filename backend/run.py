import dotenv
import dotenv

dotenv_variables = dotenv.dotenv_values()
PORT=dotenv_variables.get('PORT')

if not PORT:
    PORT = 3000


from app import app



if __name__ == "__main__":
    app.run(port=PORT)