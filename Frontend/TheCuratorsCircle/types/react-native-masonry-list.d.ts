declare module 'react-native-masonry-list' {
    import { Component } from 'react';
    import { ViewStyle, ImageSourcePropType, RefreshControlProps } from 'react-native';

    interface MasonryItem {
        id: string | number;
        uri?: string;
        url?: string;
        source?: ImageSourcePropType;
        dimensions?: {
            width?: number;
            height?: number;
        };
        [key: string]: any;
    }

    interface MasonryListProps extends RefreshControlProps {
        data: MasonryItem[];
        columns?: number;
        numColumns?: number;
        renderItem: (item: { item: MasonryItem; index: number }) => React.ReactNode;
        keyExtractor?: (item: MasonryItem, index: number) => string;
        style?: ViewStyle;
        columnStyle?: ViewStyle;
        spacing?: number;
        sorted?: boolean;
        imageSourceProperty?: string;
        dimensionsProperty?: string;
        onEndReached?: () => void;
        onEndReachedThreshold?: number;
        ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
        ListEmptyComponent?: React.ComponentType<any> | React.ReactElement;
        contentContainerStyle?: ViewStyle;
    }

    export default class MasonryList extends Component<MasonryListProps> {}
}
