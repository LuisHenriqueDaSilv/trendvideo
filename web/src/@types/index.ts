import {ReactNode} from 'react'

export interface contextProviderProps {
    children: ReactNode
}

export interface showAlertParams {
    title: 'error'|string,
    message: string
}

export interface AlertContextData {
    showAlert: (params: showAlertParams) => void,
    closeAlert: () => void
}

export interface AlertProps{
    title: 'error'|string,
    percentageToEnd: number,
    message: string,
    closeAlert: () => void
}

export interface LoadingContextData {
    enableLoading: () => void,
    disableLoading: () => void
}
