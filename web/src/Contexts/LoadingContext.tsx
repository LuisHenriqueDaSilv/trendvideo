import {
    createContext,
    useState
} from 'react'

import {contextProviderProps, LoadingContextData} from '../@types'

//Components
import {Loading} from '../Components/Loading'

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