def format_number(number):
    
    try: 
        number = int(number)
    except: 
        return number
    
    number_str = str(number)
    number_complement = ''
    
    if len(number_str) > 9:
        number_complement = 'b'
        number_str = number_str[:-9]
    elif len(number_str) > 6:
        number_complement = 'mi'
        number_str = number_str[:-6]
    elif len(number_str) > 3:
        number_complement = 'k'
        number_str = number_str[:-3]
        
    return f'{number_str}{number_complement}'
