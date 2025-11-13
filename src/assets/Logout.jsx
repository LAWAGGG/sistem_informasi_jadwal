import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BASE_URL, getToken, removeToken } from "../utils/utils"

export default function Logout() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    async function handleLogout(e) {
        e.preventDefault()
        setIsLoading(true)

        try {
            setTimeout(() => {
                removeToken()
                navigate('/', { replace: true })
                setIsLoading(false)
            }, 1000)
        } catch (error) {
            console.error("Logout error:", error)
            removeToken()
            navigate('/', { replace: true })
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="fixed right-5 bottom-5">
                <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {/* Background shine effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-2">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Logging out...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="font-semibold">Logout</span>
                            </>
                        )}
                    </div>
                </button>

                {/* Tooltip */}
                <div className="absolute -top-12 right-0 bg-gray-800 text-white text-sm py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Keluar dari sistem
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
            </div>
        </>
    )
}