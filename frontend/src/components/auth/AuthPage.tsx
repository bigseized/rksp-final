import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-4">
                {isLogin ? <Login showTitle={true} /> : <Register showTitle={true} />}
                <div className="text-center">
                    {isLogin ? (
                        <p className="text-sm text-gray-600">
                            Нет аккаунта?{' '}
                            <button
                                onClick={() => setIsLogin(false)}
                                className="text-primary-600 hover:text-primary-500 font-medium"
                            >
                                Зарегистрироваться
                            </button>
                        </p>
                    ) : (
                        <p className="text-sm text-gray-600">
                            Уже есть аккаунт?{' '}
                            <button
                                onClick={() => setIsLogin(true)}
                                className="text-primary-600 hover:text-primary-500 font-medium"
                            >
                                Войти
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage; 