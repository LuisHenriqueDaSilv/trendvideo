import {
    createContext, 
    useState, 
    useRef, 
    useEffect
} from 'react'

//Components
import {Alert} from '../Components/Alert'

//Interfaces
import {
    contextProviderProps,
    showAlertParams,
    AlertContextData
} from '../@types'


const AlertContext = createContext({} as AlertContextData)

export default AlertContext

export function AlertContextProvider({children}:contextProviderProps){

    const countdownTimeoutRef = useRef(0);
    const alertDuration = 20 //seconds

    const [
        isShowingAlert,
        setIsShowingAlert
    ] = useState<boolean>(false)
    const [
        message,
        setMessage
    ] = useState<string>('')
    const [
        alertType, 
        setAlertType
    ] = useState<'error' | string>('error')
    const [
        timeToCloseAlert, 
        setTimeToCloseAlert
    ] = useState<number>(0)

    useEffect(() => {

        if(isShowingAlert && timeToCloseAlert < alertDuration){

            countdownTimeoutRef.current = window.setTimeout(() => {
                setTimeToCloseAlert(timeToCloseAlert + 0.1)
            }, 100)

        }else if(isShowingAlert) {

            resetAlertStates()
        }

    }, [timeToCloseAlert, isShowingAlert])


    const resetAlertStates = () => {

        setIsShowingAlert(false)
        setMessage('')
        setTimeToCloseAlert(0)
        window.clearTimeout(countdownTimeoutRef.current)

    }

    const showAlert = ({title, message}: showAlertParams) => {
        resetAlertStates()
        const audio = new Audio('/alert.mp3')
        audio.volume = 0.2
        audio.play()

        setMessage(message)
        setAlertType(title)
        setIsShowingAlert(true)
    }

    const closeAlert = () => {
        if(isShowingAlert){
            resetAlertStates()
        }

    }

    
    return (
        <AlertContext.Provider 
            value={{
                showAlert, 
                closeAlert
            }}
        >
            {children}
            {
                isShowingAlert? (
                    <Alert 
                        percentageToEnd={
                            ((timeToCloseAlert *100) / alertDuration)/100 //timeToCloseAlert represents how many percent of alertDuration
                        }
                        title={alertType}
                        message={message}
                        closeAlert={closeAlert}
                    />
                ):null
            }
        </AlertContext.Provider>
    )
}
