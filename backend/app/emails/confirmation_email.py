def gen_confirmation_email_body(confirm_url):

    return f"""

        <div 
            style="
                background-color: #69C9D0;
                border-radius: 5px;
                padding: 30px;
                text-align:center;
                color: #fff;
            "
        >
            <h1>Confirm email to create your account in TrendVideo</h1>
            <h3>Was maked one request to create accout using your email.</h3>
            
            <a
                href="{confirm_url}" 
                style="
                    color: #EE1D52;
                    font-size: 2rem
                "
            > 
                confirm
            </a>

            <h1>it was't you? </h1>
            <h3>If was't you, just ignore this email</h3>
        </div>
    """
