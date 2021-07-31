def gen_confirmation_email_body(confirm_url, server_url):

    return f"""
        <div 
            style="
                text-align: center;
                background-color: #69C9D0;
                border-radius: 5px;
                padding: 5rem;
                padding-bottom: 15rem;
                color: #fff;
                background: linear-gradient(to left bottom , #181A1B 50%, #042628 10%);
                font-family: monospace;
                font-weight: 700;
            "
        >
        <h1 style="font-size: 3rem;">Trend Video</h1>
        <img 
            style="
                height: 10rem;
            " 
            src="{server_url}/static/Logo.png"
            alt="Logo"
        />
        <h1 
            style="
                font-size: 2rem;
            "
        >Confirm your email to enable your account</h1>
        <p 
            style="
                font-size: 1.3rem;
                margin: 2rem
            "
        >Was maked one request to create account using your email.</p>
        <a
            href="{confirm_url}"
            style="
                text-decoration: none;
                color: #0B8308;
                transition: 200ms;
            "
            onMouseOver="this.style.color='#086D83'"
            onMouseOut="this.style.color='#0B8308'"
        >
            <h1>
                confirm
            </h1>
        </a>
        <p style="margin: 2rem; font-size: 1.3rem;">If was't you, just ignore this email</p>
    </div>
    """