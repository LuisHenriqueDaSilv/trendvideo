import {createContext, ReactNode} from 'react'

//Components
import {Alert} from '../Components/Alert'

interface AlertContextProviderProps {
    children: ReactNode
}
interface AlertContextData {
    showAlert: (type:'error'|'notification') => void
}


const AlertContext = createContext({} as AlertContextData)

export function AlertContextProvider({children}:AlertContextProviderProps){

    const showAlert = (type:'error'|'notification') => {
        new Audio('/alert.mp3').play()
    }
    
    return (
        <AlertContext.Provider 
            value={{
                showAlert
            }}
        >
            {children}
            <Alert 
                percentageToEnd={30/100}
                type="error"
                message="Password not provided"
            />

        </AlertContext.Provider>
    )
}