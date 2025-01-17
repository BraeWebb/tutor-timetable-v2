import { FC, ReactElement } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

type Props = {
    isLoading: boolean;
    renderLoading?: () => ReactElement;
    children: ReactElement | null;
};

export const Loadable: FC<Props> = ({
    isLoading,
    renderLoading = () => <LoadingSpinner />,
    children,
}) => {
    return isLoading ? renderLoading() : children;
};
