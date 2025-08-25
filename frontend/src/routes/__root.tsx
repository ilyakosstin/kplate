import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import {
    QueryClientProvider,
    QueryClient,
    useQuery,
} from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { authContext } from "@/lib/auth";
import { useContext } from "react";

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: RootRoute,
});

function AuthProvider({ children }) {
    const { data, isLoading, isSuccess, isError } = useQuery({
        queryKey: ["auth"],
        queryFn: () => axiosInstance.get("/auth/me"),
    });

    const value = {
        isLoading,
        isSuccess,
        isError,
        user: isSuccess ? data.data.user : null,
    };

    return (
        <authContext.Provider value={value}>{children}</authContext.Provider>
    );
}

function AuthStatus() {
    const { isLoading, isSuccess, user } = useContext(authContext);

    if (isLoading) {
        return <div></div>;
    } else if (isSuccess && user !== undefined && user !== null) {
        return (
            <Link to="/account">
                <Button>{user.name}</Button>
            </Link>
        );
    }

    return (
        <Link to="/auth/login">
            <Button>Войти</Button>
        </Link>
    );
}

function Nav() {
    const { user } = useContext(authContext);

    if (user === null || !user.is_business) {
        return <></>;
    }

    return <Link to="/panel">Панель</Link>;
}

function RootRoute() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <div className="h-[100vh] w-full flex flex-col">
                    <header className="w-full h-[50px] bg-gray-100 flex items-center justify-between px-3 shrink-0">
                        <Link to="/home">
                            <span className="text-2xl">kplate</span>
                        </Link>
                        <Nav />
                        <AuthStatus />
                    </header>
                    <main className="h-full p-2">
                        <Outlet />
                    </main>
                    <footer className="w-full h-[100px] bg-gray-100 shrink-0">
                        <p>TG KANAL</p>
                    </footer>
                </div>

                <TanstackDevtools
                    config={{
                        position: "bottom-left",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                    ]}
                />
            </AuthProvider>
        </QueryClientProvider>
    );
}
