import { useEffect, useState } from "react";
import { setToken, getToken } from "../utils/utils"; // Import named exports
import { useNavigate } from "react-router-dom";
import jsonDataService from "../services/jsonDataService";

export default function Login() {
    const [usn, setUsn] = useState('');
    const [pass, setPass] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const token = getToken();

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!usn.trim() || !pass.trim()) {
            setError('Username dan password harus diisi');
            setIsLoading(false);
            return;
        }

        try {
            const result = await jsonDataService.login(usn, pass);
            
            if (result.success) {
                setToken(result.token, rememberMe);
                // Simpan info user ke localStorage
                localStorage.setItem('user', JSON.stringify(result.user));
                setTimeout(() => {
                    navigate('/dashboard');
                }, 100);
            }
        } catch (error) {
            setError(error.message || 'Login gagal. Periksa username dan password Anda.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">
                    {/* Decorative Header */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2"></div>

                    {/* Card Content */}
                    <div className="p-8">
                        {/* Logo/Icon Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                Selamat Datang
                            </h2>
                            <p className="text-gray-600">Silakan masuk ke akun Anda</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 animate-fade-in">
                                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700 text-sm flex-1">{error}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white placeholder-gray-400"
                                            placeholder="Masukkan username Anda"
                                            value={usn}
                                            onChange={(e) => {
                                                setUsn(e.target.value);
                                                setError('');
                                            }}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white placeholder-gray-400"
                                            placeholder="Masukkan password Anda"
                                            value={pass}
                                            onChange={(e) => {
                                                setPass(e.target.value);
                                                setError('');
                                            }}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        disabled={isLoading}
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Ingat saya
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:transform hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </button>
                        </form>

                        {/* Demo accounts info */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-sm text-blue-700 text-center">
                                <strong>Demo:</strong> Gunakan username dan password dari data users.json
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}