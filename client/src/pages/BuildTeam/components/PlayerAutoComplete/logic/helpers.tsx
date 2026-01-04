import {List, ListImperativeAPI, RowComponentProps} from "react-window";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import * as React from "react";
import {useMediaQuery, useTheme} from "@mui/material";
import {styled} from "@mui/material/styles";
import Popper from "@mui/material/Popper";
import {autocompleteClasses} from "@mui/material/Autocomplete";
import {Player} from "../../../../../Interfaces/Player";

const LISTBOX_PADDING = 8;

/* ---------- Types ---------- */

type ItemData = Array<
    | { key: number; group: string; children: React.ReactNode }
    | [React.ReactElement, Player, number]
>;

export function RowComponent({
                                 index,
                                 itemData,
                                 style,
                                 onRowRender,
                             }: RowComponentProps & { itemData: ItemData; onRowRender?: (rowIndex: number) => void }) {

    // Call the callback when this row is rendered
    React.useEffect(() => {
        if (onRowRender) {
            onRowRender(index);
        }
    }, [index, onRowRender]);

    const data = itemData[index];
    const inlineStyle = {
        ...style,
        top: ((style.top as number) ?? 0) + LISTBOX_PADDING,
    };

    if ('group' in data) {
        return (
            <ListSubheader component="div" style={inlineStyle}>
                {data.group}
            </ListSubheader>
        );
    }

    const { key, ...optionProps } = data[0];
    const player = data[1];

    return (
        <Typography component="li" {...optionProps} key={key} noWrap style={inlineStyle}>
            {player.full_name} — {player.team} ({player.position})
        </Typography>
    );
}

/* ---------- Listbox ---------- */

export const ListboxComponent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement> & {
    internalListRef: React.Ref<ListImperativeAPI>;
    onItemsBuilt: (optionIndexMap: Map<string, number>) => void;
    onRowRender: (rowIndex: number) => null;
}
>(function ListboxComponent(props, ref) {
    const {children, internalListRef, onItemsBuilt, ...other} = props;
    const itemData: ItemData = [];
    const optionIndexMap = React.useMemo(() => new Map<string, number>(), []);

    (children as ItemData).forEach((item) => {
        itemData.push(item);
        if ('children' in item && Array.isArray(item.children)) {
            itemData.push(...item.children);
        }
    });


    // Map option values to their indices in the flattened array
    itemData.forEach((item, index) => {
        if (Array.isArray(item) && item[1]) {
            optionIndexMap.set(item[1]?.full_name, index);
        }
    });

    React.useEffect(() => {
        if (onItemsBuilt) {
            onItemsBuilt(optionIndexMap);
        }
    }, [onItemsBuilt, optionIndexMap]);

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
        noSsr: true,
    });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child: ItemData[number]) => {
        if (child.hasOwnProperty('group')) {
            return 48;
        }
        return itemSize;
    };

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    // Separate className for List, other props for wrapper div (ARIA, handlers)
    const {className, style, ...otherProps} = other;

    return (
        <div ref={ref} {...otherProps}>
            <List
                className={className}
                listRef={internalListRef}
                rowCount={itemCount}
                rowHeight={(index) => getChildSize(itemData[index])}
                rowComponent={RowComponent} // just pass the component
                rowProps={{
                    itemData,
                    onRowRender: props.onRowRender // forward the callback
                }}
                style={{
                    height: getHeight() + 2 * LISTBOX_PADDING,
                    width: '100%',
                }}
                overscanCount={5}
                tagName="ul"
            />
        </div>
    );
});

/* ---------- Styled Popper ---------- */

export const StyledPopper = styled(Popper)(() => ({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {padding: 0, margin: 0},
    },
}));