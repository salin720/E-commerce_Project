declare module 'react-image-magnify' {
    import * as React from 'react';

    export interface ReactImageMagnifyProps {
        smallImage: {
            alt: string;
            isFluidWidth?: boolean;
            src: string;
            width?: number;
            height?: number;
        };
        largeImage: {
            src: string;
            width: number;
            height: number;
        };
        enlargedImageContainerDimensions?: {
            width?: string | number;
            height?: string | number;
        };
        enlargedImagePosition?: 'beside' | 'over';
        lensStyle?: React.CSSProperties;
        shouldUsePositiveSpaceLens?: boolean;
        isHintEnabled?: boolean;
        shouldHideHintAfterFirstActivation?: boolean;
        imageClassName?: string;
        lensComponent?: React.ComponentType;
    }

    const ReactImageMagnify: React.FC<ReactImageMagnifyProps>;
    export default ReactImageMagnify;
}
