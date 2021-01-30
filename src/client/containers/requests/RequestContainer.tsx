import React from "react";
import { Role } from "../../../types/user";
import { Requests } from "../../components/requests/Requests";
import { StepModal } from "../../components/helpers/StepModal";
import { Box } from "@chakra-ui/react";

export enum DisplayRequestType {
    All = "All",
    Personal = "Personal",
}

export enum FilterType {
    Temporary = "Temporary",
    Permanent = "Permanent",
    Cover = "Cover",
    Swap = "Swap",
}

type Props = {
    userType: Role;
};

export const RequestContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    //Filter management.
    const [filters, setFilters] = React.useState<Array<FilterType>>([]);

    // Update list of filters.
    const updateFilters = (item: FilterType, selected: boolean) => {
        let tempArr: Array<FilterType> = [...filters];

        if (filters.indexOf(item) > -1 && !selected) {
            tempArr.splice(filters.indexOf(item), 1);
            setFilters(tempArr);
        } else if (filters.indexOf(item) === -1 && selected) {
            tempArr.push(item);
            setFilters(tempArr);
        }
    };

    return (
        <>
            <Requests toggleFilters={updateFilters} filters={filters} />
        </>
    );
};
