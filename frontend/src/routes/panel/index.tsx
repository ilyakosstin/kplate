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
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

export const Route = createFileRoute("/panel/")({
    component: RouteComponent,
});

const itemSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(0).max(100),
    amount: z.int().min(0).max(100),
    price_orig: z.int().min(0),
    price_disc: z.int().min(0),
});

const defaultItem = {
    name: "Новый товар",
    description: "Описание",
    amount: 1,
};

enum DialogMode {
    EDIT,
    CREATE,
    NONE,
}

function ItemPropertiesForm({ item, onSave, children }) {
    const methods = useForm({
        resolver: zodResolver(itemSchema),
        defaultValues: item,
    });
    const { register, handleSubmit } = methods;

    const onSubmit = (data) => {
        onSave(data);
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-1"
            >
                <InputWrapper title="Имя товара" name="name">
                    <Input {...register("name")} type="text" />
                </InputWrapper>
                <InputWrapper title="Описание" name="description">
                    <Input {...register("description")} type="text" />
                </InputWrapper>

                <InputWrapper title="Цена без скидки" name="price_orig">
                    <Input
                        {...register("price_orig", { setValueAs: parseInt })}
                        type="number"
                    />
                </InputWrapper>
                <InputWrapper title="Цена со скидкой" name="price_disc">
                    <Input
                        {...register("price_disc", { setValueAs: parseInt })}
                        type="number"
                    />
                </InputWrapper>

                <InputWrapper title="В наличии" name="amount">
                    <Input
                        {...register("amount", {
                            setValueAs: parseInt,
                        })}
                        type="number"
                    />
                </InputWrapper>
                {children}
            </form>
        </FormProvider>
    );
}

function ItemSummary({
    name,
    description,
    amount,
    onIncreaseAmount,
    onDecreaseAmount,
    onEdit,
}) {
    return (
        <div className="flex items-center gap-1 shadow-sm py-1 px-2 rounded-sm">
            <div className="w-full flex flex-col">
                <p className="text-xl font-bold mb-0">{name}</p>
                <p className="text-sm">{description}</p>
            </div>
            <Button onClick={onDecreaseAmount} disabled={amount === 0}>
                <Minus />
            </Button>
            <span className="mx-1 text-lg w-[2em] text-center">{amount}</span>
            <Button onClick={onIncreaseAmount}>
                <Plus />
            </Button>
            <Button onClick={onEdit}>
                <Edit />
            </Button>
        </div>
    );
}

function ItemList({ items, onIncrement, onDecrement, onEdit }) {
    return (
        <>
            <ul className="w-[500px] flex flex-col gap-1">
                {items.map((item, i) => (
                    <li key={i}>
                        <ItemSummary
                            {...item}
                            onIncreaseAmount={() => onIncrement(i)}
                            onDecreaseAmount={() => onDecrement(i)}
                            onEdit={() => onEdit(i)}
                        />
                    </li>
                ))}
            </ul>
            {items.length == 0 && <p>No items to show...</p>}
        </>
    );
}

function CreateItemDialog({ open, defaultValues, onCreate, onCancel }) {
    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Создать новый товар</DialogTitle>
                </DialogHeader>
                <ItemPropertiesForm item={defaultValues} onSave={onCreate}>
                    <div className="flex gap-2 mt-3">
                        <Button variant="outline" type="submit">
                            Создать
                        </Button>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={onCancel}
                        >
                            Отмена
                        </Button>
                    </div>
                </ItemPropertiesForm>
            </DialogContent>
        </Dialog>
    );
}

function EditItemDialog({ open, currentItem, onSave, onDelete, onCancel }) {
    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Редактировать товар</DialogTitle>
                </DialogHeader>
                <ItemPropertiesForm item={currentItem} onSave={onSave}>
                    <div className="flex gap-2 mt-3">
                        <Button variant="outline" type="submit">
                            Сохранить
                        </Button>
                        <Button variant="destructive" onClick={onDelete}>
                            Удалить
                        </Button>
                    </div>
                </ItemPropertiesForm>
            </DialogContent>
        </Dialog>
    );
}

enum ItemMutationType {
    EDIT,
    CREATE,
    DELETE,
}

function RouteComponent() {
    const {
        data: itemsData,
        isLoading: areItemsLoading,
        isSuccess: areItemsSuccessfullyLoaded,
        refetch: refetchItems,
    } = useQuery({
        queryKey: ["mine_items"],
        queryFn: () => axiosInstance.get("/business/items/mine"),
    });

    console.log(itemsData);

    const { mutate: mutateItem, isPending: isItemMutationPending } =
        useMutation({
            mutationKey: ["mutate_item"],
            mutationFn: (payload) => {
                console.log(payload);
                if (payload.type == ItemMutationType.DELETE)
                    return axiosInstance.post("/business/items/delete", {
                        id: payload.id,
                    });
                else if (payload.type == ItemMutationType.CREATE)
                    return axiosInstance.post(
                        "/business/items/create",
                        payload.item
                    );
                else if (payload.type == ItemMutationType.EDIT)
                    return axiosInstance.post(
                        "/business/items/edit",
                        payload.item
                    );
                throw "unknown mutation type";
            },
            onSuccess: () => {
                refetchItems();
            },
            onError: () => {},
            onSettled: (data) => {
                console.log(data);
            },
        });

    const [dialogMode, setDialogMode] = useState(DialogMode.NONE);
    const [dialogTargets, setDialogTargets] = useState({
        edit: 0,
        create: defaultItem,
    });

    const getItem = (i) => (itemsData?.data?.items ?? [])[i];

    return (
        <>
            <div>
                <h1 className="text-2xl">Товары</h1>
                <div className="mt-2">
                    {areItemsLoading && <p>Загрузка товаров...</p>}
                    {!areItemsLoading && !areItemsSuccessfullyLoaded && (
                        <p>Items failed to load</p>
                    )}
                    {areItemsSuccessfullyLoaded && (
                        <>
                            <ItemList
                                items={itemsData?.data?.items}
                                onIncrement={(i) =>
                                    mutateItem({
                                        type: ItemMutationType.EDIT,
                                        item: {
                                            ...getItem(i),
                                            amount: getItem(i).amount + 1,
                                        },
                                    })
                                }
                                onDecrement={(i) =>
                                    mutateItem({
                                        type: ItemMutationType.EDIT,
                                        item: {
                                            ...getItem(i),
                                            amount: getItem(i).amount - 1,
                                        },
                                    })
                                }
                                onEdit={(i) => {
                                    setDialogTargets({
                                        ...dialogTargets,
                                        edit: i,
                                    });
                                    setDialogMode(DialogMode.EDIT);
                                }}
                            />
                            <Button
                                onClick={() => {
                                    setDialogTargets({
                                        ...dialogTargets,
                                        create: defaultItem,
                                    });
                                    setDialogMode(DialogMode.CREATE);
                                }}
                                className="mt-3"
                            >
                                Добавить товар
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <CreateItemDialog
                open={dialogMode == DialogMode.CREATE}
                defaultValues={dialogTargets.create}
                onCancel={() => {
                    setDialogMode(DialogMode.NONE);
                }}
                onCreate={(data) => {
                    setDialogMode(DialogMode.NONE);
                    mutateItem({ type: ItemMutationType.CREATE, item: data });
                }}
            />
            <EditItemDialog
                open={dialogMode == DialogMode.EDIT}
                currentItem={getItem(dialogTargets.edit) ?? defaultItem}
                onDelete={() => {
                    setDialogMode(DialogMode.NONE);
                    mutateItem({
                        type: ItemMutationType.DELETE,
                        id: getItem(dialogTargets.edit).id,
                    });
                }}
                onSave={(data) => {
                    setDialogMode(DialogMode.NONE);
                    mutateItem({
                        type: ItemMutationType.EDIT,
                        item: { ...data, id: getItem(dialogTargets.edit).id },
                    });
                }}
                onCancel={() => {
                    setDialogMode(DialogMode.NONE);
                }}
            />
        </>
    );
}
