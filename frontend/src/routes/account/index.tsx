import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/account/")({
    component: RouteComponent,
});

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [logout, setLogout] = useState(false);
    const { isSuccess } = useQuery({
        queryKey: ["logout"],
        queryFn: () => axiosInstance.get("/auth/logout"),
        enabled: logout,
    });

    if (isSuccess) {
        navigate({ to: "/auth/login" });
        queryClient.invalidateQueries(["auth"]);
    }

    return <Button onClick={() => setLogout(true)}>Выйти</Button>;
}
