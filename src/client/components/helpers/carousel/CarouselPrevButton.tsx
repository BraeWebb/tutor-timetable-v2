import React, { useContext } from "react";
import { BsChevronLeft } from "react-icons/bs";
import { CarouselContext } from "./Carousel";
import { IconButton, IconButtonProps } from "@chakra-ui/react";

type Props = {
    as?: IconButtonProps["icon"];
};

export const CarouselPrevButton: React.FC<Props> = ({ as }) => {
    const { previousSlide } = useContext(CarouselContext);
    return (
        <IconButton
            aria-label="previous-slide"
            icon={as || <BsChevronLeft />}
            onClick={() => previousSlide()}
            isRound
            variant="ghost"
        />
    );
};