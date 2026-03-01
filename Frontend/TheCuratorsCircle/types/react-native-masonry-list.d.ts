declare module 'react-native-masonry-list' {
    import { Component } from 'react';
    import { ViewStyle, ImageSourcePropType } from 'react-native';

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

    interface MasonryListProps {
        data: MasonryItem[];
        columns?: number;
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
    }

    export default class MasonryList extends Component<MasonryListProps> {}
}
