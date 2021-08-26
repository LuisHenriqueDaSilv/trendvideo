<h1 align=center><strong>TrendVideo</strong></h1>
<p align=center><strong>The place to explore your creativity</strong></p>
</br>
<p align=center>TrendVideo is a short video platform</p>
<p align=center></br>This project was created to practice programation logic with python and javascript, train my skills with react (Frontend web) and learn about Flask (Backend)</p>

## **Project status:**
> **status**: ***Finished***</br> 

## **Dependencies to run:**
- [Python3](https://www.python.org/downloads/)
- [Pip](https://pypi.org/project/pip/)
- [Nodejs](https://nodejs.org/en/)
- [Npm](https://docs.npmjs.com/getting-started)

</br>

## **How run**
</br>

##### **Clone respository**

```bash
  git clone https://github.com/LuisHenriqueDaSilv/trendvideo.git
```

### **Run backend**

##### **Join in path**

```bash
  cd backend
```

##### **Install dependencies**
*Recommended use a virtual environment. [How create virtual environment](https://docs.python.org/3/library/venv.html)*
```bash
  pip install -r requirements.txt
```

##### **Run database migrations**
```bash 
  flask db init && flask db migrate && flask db upgrade
```

##### **Create dotenv variables**
*Create .env file following .env.example*

##### **Run**
```bash
  python3 run.py
```

### **Run FrontEnd**

##### **Join in path**

```bash
  cd web
```

##### **Install dependencies**

```bash
  npm i
```

##### **Create dotenv variables**
*Create .env file following .env.example*

##### **Run**
```bash
  npm start
```
