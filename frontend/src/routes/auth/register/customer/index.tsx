import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import InputWrapper from "@/components/form/inputWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerRegisterSchema } from "@/lib/schema";
import axiosInstance from "@/lib/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/auth/register/customer/")({
    component: RouteComponent,
});

function RouteComponent() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const methods = useForm({
        resolver: zodResolver(customerRegisterSchema),
    });
    const { register, handleSubmit } = methods;
    const { mutate, isPending } = useMutation({
        mutationKey: ["register.customer"],
        mutationFn: (data) => axiosInstance.post("/auth/register/", data),
        onSuccess: (res) => {
            console.log(res);
            queryClient.invalidateQueries(["auth"]);
            navigate({ to: "/home" });
        },
    });

    const onSubmit = (data) => {
        const toSend = {
            name: data.name,
            password: data.password,
            email: data.email,
            is_business: false,
        };
        mutate(toSend);
    };

    //abc12345

    return (
        <FormProvider {...methods}>
            <h1 className="font-bold text-[30px] mb-3">Регистрация</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-1"
            >
                <InputWrapper name="name" title="Имя">
                    <Input {...register("name")} type="text" />
                </InputWrapper>

                <InputWrapper name="email" title="Электронная почта">
                    <Input {...register("email")} type="email" />
                </InputWrapper>

                <InputWrapper title="Пароль" name="password">
                    <Input {...register("password")} type="password" />
                </InputWrapper>

                <InputWrapper title="Повторите пароль" name="confirmPassword">
                    <Input {...register("confirmPassword")} type="password" />
                </InputWrapper>

                <div>
                    <ul>
                        <li>
                            <Link to="/auth/login">Уже есть аккаунт</Link>
                        </li>
                        <li>
                            <Link to="/auth/register/business">
                                Регистрация для бизнеса
                            </Link>
                        </li>
                    </ul>
                    <Button type="submit" className="mt-3" disabled={isPending}>
                        Создать аккаунт
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
