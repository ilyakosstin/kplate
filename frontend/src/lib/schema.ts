import { array, z } from "zod";
import { ymapsDirectGeocode } from "./ymaps";

export const loginSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export const customerRegisterSchema = z
    .object({
        email: z.string().email("Неверный формат"),
        name: z
            .string()
            .min(3, "Имя должно быть не короче 3 символов")
            .max(60, "Имя должно быть не длиннее 60 символов")
            .regex(/^[-A-Za-zА-Яа-я0-9_]*$/, "Недопустимые символы"),
        password: z
            .string()
            .min(8, "Пароль должен быть не короче 8 символов")
            .max(50, "Пароль должен быть не длиннее 50 символов")
            .regex(
                /^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$/,
                "Пароль должен содержать латинские буквы и цифры"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Пароли должны совпадать",
        path: ["confirmPassword"],
    });

export const businessRegisterSchema = z
    .object({
        email: z.string().email("Неверный формат"),
        name: z
            .string()
            .min(3, "Имя должно быть не короче 3 символов")
            .max(60, "Имя должно быть не длиннее 60 символов")
            .regex(/^[-A-Za-zА-Яа-я0-9_]*$/, "Недопустимые символы"),
        password: z
            .string()
            .min(8, "Пароль должен быть не короче 8 символов")
            .max(50, "Пароль должен быть не длиннее 50 символов")
            .regex(
                /^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$/,
                "Пароль должен содержать латинские буквы и цифры"
            ),
        confirmPassword: z.string(),
        address: z
            .string()
            .transform((addr) => ymapsDirectGeocode(addr))
            .refine(
                (data) => data.checked,
                "Не удалось проверить адрес на корректность"
            )
            .refine((data) => data.valid, "Неверный адрес"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Пароли должны совпадать",
        path: ["confirmPassword"],
    });
