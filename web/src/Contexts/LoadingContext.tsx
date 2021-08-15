import {
    createContext,
    useState
} from 'react'

//Components
import {Loading} from '../Components/Loading'

//Interfaces
import {contextProviderProps} from '../@types'
interface LoadingContextData {
    enableLoading: () => void,
    disableLoading: () => void
}


const LoadingContext = createContext({} as LoadingContextData)
export default LoadingContext

export function LoadingContextProvider({children}: contextProviderProps){

    const [
        showLoadingComponent, 
        setShowLoadingComponent
    ] = useState<boolean>(false)

    const enableLoading = () => {
        setShowLoadingComponent(true)
    }

    const disableLoading = () => {
        setShowLoadingComponent(false)
    }

    return(
        <LoadingContext.Provider
            value={{
                enableLoading,
                disableLoading
            }}
        >
            {children}
            {
                showLoadingComponent? <Loading/>:null
            }
        </LoadingContext.Provider>
    )
}