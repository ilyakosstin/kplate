import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

export const Route = createFileRoute("/home/")({
    component: RouteComponent,
});

function SellerItem({ item }) {
    return (
        <div className="shadow-sm p-2 grid grid-cols-[1fr_auto] grid-rows-2 rounded-sm">
            <p className="font-bold text-xl">{item.name}</p>
            <p className="justify-self-end">
                {item.amount > 0 ? item.amount + "шт." : "Нет в наличии"}
            </p>
            <p>{item.description}</p>
            <p className="justify-self-end">
                <s className="mr-1">{item.price_orig}₽</s>
                {item.price_disc}₽
            </p>
        </div>
    );
}

function RouteComponent() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [observedSeller, setObservedSeller] = useState({
        name: "null",
        items: [],
    });
    const [map, setMap] = useState(null);

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ["sellers"],
        queryFn: () => axiosInstance.get("/customer/sellers"),
    });

    const showMenu = useEffect(() => {
        window.showMenu = (sellerId) => {
            const seller = data.data.sellers.find((s) => s.id == sellerId);
            setDrawerOpen(true);
            setObservedSeller(seller);
        };
        console.log(data?.data.sellers);
    }, [data]);

    useEffect(() => {
        if (window.ymaps === undefined) {
            return;
        }

        ymaps.ready(() => {
            const m = new ymaps.Map("map", {
                center: [59.92, 30.34],
                zoom: 12,
            });
            setMap(m);
        });
    }, [window.ymaps]);

    useEffect(() => {
        if (isLoading || map === null) return;

        const sellers = data!.data.sellers;

        sellers.forEach((seller) => {
            const balloonContent = `
                    <div class="cafe-balloon">
                        <h3 style='font-size: 25px; margin-top: 0px; margin-bottom: 10px;'>${
                            seller.name
                        }</h3>
                        <button class="show-menu-btn" 
                                onclick="window.showMenu(${seller.id})">
                            Показать меню
                        </button>
                    </div>
                `;

            const placemark = new ymaps.Placemark(
                seller.coords,
                {
                    balloonContent: balloonContent,
                },
                {
                    balloonCloseButton: true,
                    hideIconOnBalloonOpen: false,
                }
            );

            placemark.events.add("click", function (e) {
                e.preventDefault();
                placemark.balloon.open();
            });

            map.geoObjects.add(placemark);
        });
    }, [map, isLoading]);

    return (
        <>
            <Drawer
                direction="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>
                            <h1 className="text-2xl">{observedSeller.name}</h1>
                        </DrawerTitle>
                        <p>{observedSeller.address}</p>
                    </DrawerHeader>

                    <ul className="w-full flex flex-col gap-1">
                        {observedSeller.items.map((item) => (
                            <li key={item.id} className="w-full py-1 px-2">
                                <SellerItem item={item} />
                            </li>
                        ))}
                    </ul>

                    <DrawerFooter>
                        <Button
                            onClick={() => setDrawerOpen(false)}
                            variant="outline"
                        >
                            Закрыть
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            <div id="map" style={{ width: "100%", height: "100%" }}></div>
        </>
    );
}
