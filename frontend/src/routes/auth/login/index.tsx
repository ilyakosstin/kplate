import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import InputWrapper from "@/components/form/inputWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schema";
import axiosInstance from "@/lib/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/auth/login/")({
    component: RouteComponent,
});

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const methods = useForm({
        resolver: zodResolver(loginSchema),
    });
    const { register, handleSubmit } = methods;
    const { mutate, isPending } = useMutation({
        mutationKey: ["login"],
        mutationFn: (data) => axiosInstance.post("/auth/login/", data),
        onSuccess: (res) => {
            console.log(res);
            if (res.data.success == true) {
                navigate({ to: "/home" });
                queryClient.invalidateQueries(["auth"]);
            } else {
                alert("failed to log in");
            }
        },
    });

    const onSubmit = (toSend) => {
        mutate(toSend);
    };

    //abc12345

    return (
        <FormProvider {...methods}>
            <h1 className="font-bold text-[30px] mb-3">Вход</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-1"
            >
                <InputWrapper name="email" title="Электронная почта">
                    <Input {...register("email")} type="email" />
                </InputWrapper>

                <InputWrapper title="Пароль" name="password">
                    <Input {...register("password")} type="password" />
                </InputWrapper>
                <div>
                    <ul>
                        <li>
                            <Link to="/auth/register/customer">
                                Создать аккаунт
                            </Link>
                        </li>
                    </ul>
                    <Button type="submit" className="mt-3" disabled={isPending}>
                        Войти
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
