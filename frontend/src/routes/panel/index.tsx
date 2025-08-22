import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import InputWrapper from "@/components/form/inputWrapper";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/panel/")({
    component: RouteComponent,
});

function Item({
    name,
    description,
    amount,
    onIncreaseAmount,
    onDecreaseAmount,
    onEdit,
}) {
    return (
        <div className="flex items-center gap-1">
            <div className="w-full flex flex-col">
                <p className="text-xl font-bold mb-0">{name}</p>
                <p className="text-sm">{description}</p>
            </div>
            <Button onClick={onDecreaseAmount} disabled={amount === 0}>
                <Minus />
            </Button>
            <span className="mx-1 text-lg">{amount}</span>
            <Button onClick={onIncreaseAmount}>
                <Plus />
            </Button>
            <Button onClick={onEdit}>
                <Edit />
            </Button>
        </div>
    );
}

const itemSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(0).max(100),
    amount: z.int().min(0).max(100),
});

function EditItemForm({ item, onSave, onDelete }) {
    const methods = useForm({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            name: item?.name,
            description: item?.description,
            amount: item?.amount,
        },
    });
    const { register, handleSubmit } = methods;

    const onSubmit = (data) => {
        onSave(data);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <InputWrapper title="Имя товара" name="name">
                    <Input {...register("name")} type="text" />
                </InputWrapper>
                <InputWrapper title="Описание" name="description">
                    <Input {...register("description")} type="text" />
                </InputWrapper>
                <InputWrapper title="В наличии" name="amount">
                    <Input
                        {...register("amount", {
                            setValueAs: parseInt,
                        })}
                        type="number"
                    />
                </InputWrapper>
                <div className="flex gap-2 mt-3">
                    <Button variant="outline" type="submit">
                        Сохранить
                    </Button>
                    <Button variant="destructive" onClick={onDelete}>
                        Удалить
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

function RouteComponent() {
    const [items, setItems] = useState([
        { name: "Круассан1", description: "---", amount: 1 },
        { name: "Круассан2", description: "---", amount: 2 },
        { name: "Круассан3", description: "---", amount: 3 },
    ]);
    const [editId, setEditId] = useState(-1);

    console.log("A", items);

    const editItem = (i) => {
        setEditId(i);
    };

    const updateItem = (i, newItem) => {
        setItems([...items.slice(0, i), newItem, ...items.slice(i + 1)]);
    };

    const deleteItem = (i) => {
        setItems([...items.slice(0, i), ...items.slice(i + 1)]);
    };

    const addNewItem = () => {
        setItems([
            ...items,
            { name: "Новый товар", description: "Описание", amount: 0 },
        ]);
        editItem(items.length);
    };

    return (
        <>
            <div>
                <ul className="w-[400px] bg-gray-400">
                    {items.map((item, i) => (
                        <li key={i}>
                            <Item
                                {...item}
                                onIncreaseAmount={() =>
                                    updateItem(i, {
                                        ...item,
                                        amount: item.amount + 1,
                                    })
                                }
                                onDecreaseAmount={() =>
                                    updateItem(i, {
                                        ...item,
                                        amount: item.amount - 1,
                                    })
                                }
                                onEdit={() => editItem(i)}
                            />
                        </li>
                    ))}
                </ul>

                <Button onClick={addNewItem}>Add new</Button>
            </div>

            <Dialog open={editId !== -1}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Изменить товар</DialogTitle>
                    </DialogHeader>
                    {editId > -1 && (
                        <EditItemForm
                            onDelete={() => {
                                deleteItem(editId);
                                setEditId(-1);
                            }}
                            onSave={(newItem) => {
                                updateItem(editId, newItem);
                                setEditId(-1);
                            }}
                            item={items[editId]}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
