import { FormEvent, useState } from 'react'
import {useHistory} from 'react-router-dom'

import styles from './styles.module.scss'

//Interfaces
interface SearchBarProps {
    value?: string
}

export function SearchBar({value}:SearchBarProps){

    const history = useHistory()

    const [searchTerms, setSearchTerms] = useState<string>(value || '')

    const handleSearch = (event:FormEvent) => {
        event.preventDefault()

        history.push(`/search?q=${searchTerms}`)
    }

    return (
        <form 
            className={styles.searchBarContainer}
            onSubmit={handleSearch}
        >
            <input 
                type="text"
                onChange={(event) => {setSearchTerms(event.target.value)}}
            />
            <button>
                <img alt="search icon" src="/icons/Search.png"/>
            </button>
        </form>
    )
}