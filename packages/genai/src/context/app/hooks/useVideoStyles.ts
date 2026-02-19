import { useCallback, useEffect, useState } from 'react';
import type { VideoStyle, VideoStyleOption } from '../types';
import { getBGMs } from '@/lib/api';

const baseVideoStyles: VideoStyle[] = [
    {
        name: 'Captions',
        field: 'captions',
        options: [
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/carlist_1.gif',
                selected: false,
                value: 'carlist_1',
                name: 'Carlist 1',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/carlist_2.gif',
                selected: false,
                value: 'carlist_2',
                name: 'Carlist 2',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/assemble.gif',
                selected: false,
                value: 'assemble',
                name: 'Assemble',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/carlist_3.gif',
                selected: false,
                value: 'carlist_3',
                name: 'Carlist 3',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/courage.gif',
                selected: false,
                value: 'courage',
                name: 'Courage',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/iheart.gif',
                selected: false,
                value: 'iheart',
                name: 'Iheart',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/default.gif',
                selected: false,
                value: 'default',
                name: 'Default',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/focus_with_karoke.gif',
                selected: false,
                value: 'focus_with_karoke',
                name: 'Focus with Karoke',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/hustle.gif',
                selected: false,
                value: 'hustle',
                name: 'Hustle',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/karl.gif',
                selected: false,
                value: 'karl',
                name: 'Karl',
            },
            {
                url: 'https://media.qa.begenuin.com/genai-sdk/assets/captions/lella.gif',
                selected: false,
                value: 'lella',
                name: 'Lella',
            },
        ],
        selected: false,
    },
    {
        name: 'Voice Over',
        field: 'voice_over',
        disabled: true,
        options: [
            { name: 'Voice 1', selected: false, value: 'voice_1' },
            { name: 'Voice 2', selected: false, value: 'voice_2' },
            { name: 'Voice 3', selected: false, value: 'voice_3' },
        ],
        selected: false,
    },
    {
        name: 'Background Music',
        field: 'background_music',
        options: [
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/car-beat.mp3',
                selected: false,
                value: '/assets/bg_music/car-beat.mp3',
            },
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/commercial.mp3',
                selected: false,
                value: '/assets/bg_music/commercial.mp3',
            },
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/driving.mp3',
                selected: false,
                value: '/assets/bg_music/driving.mp3',
            },
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/expo_hip_hop.mp3',
                selected: false,
                value: '/assets/bg_music/expo_hip_hop.mp3',
            },
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/informative-documentary-score-with-gentle-piano-ambience.mp3',
                selected: false,
                value: '/assets/bg_music/informative-documentary-score-with-gentle-piano-ambience.mp3',
            },
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/my-cool-car.mp3',
                selected: false,
                value: '/assets/bg_music/my-cool-car.mp3',
            },
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/real-estate-construction-architecture.mp3',
                selected: false,
                value: '/assets/bg_music/real-estate-construction-architecture.mp3',
            },
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/real-estate-fashion-luxury.mp3',
                selected: false,
                value: '/assets/bg_music/real-estate-fashion-luxury.mp3',
            },
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/real-estate-real-estate-background-music.mp3',
                selected: false,
                value: '/assets/bg_music/real-estate-real-estate-background-music.mp3',
            },
            {
                url: 'https://genuin-qa-media.s3.us-west-2.amazonaws.com/genai-sdk/assets/bg-music/Upbeat+and+and+Happy+Pop+Instrumental+Background+Music+For+Videos.mp3',
                selected: false,
                value: '/assets/bg_music/Upbeat and and Happy Pop Instrumental Background Music For Videos.mp3',
            },
        ],
        selected: false,
    },
    {
        name: 'Avatar',
        field: 'avatar',
        selected: false,
    },
    {
        name: 'Video Type',
        field: 'video_type',
        options: [
            { name: 'Short', selected: false, value: 'SHORT_FORM' },
            { name: 'Advertisement', selected: false, value: 'LONG_FORM' },
        ],
        selected: false,
    },
    {
        name: 'Feature Overlay',
        field: 'feature_overlay',
        selected: false,
    },
    {
        name: 'Enhance Images',
        field: 'enhance_images',
        selected: false,
    },
];

const cloneVideoStyles = (styles: VideoStyle[]): VideoStyle[] =>
    styles.map(style => ({
        ...style,
        options: style.options?.map((opt: VideoStyleOption) => ({ ...opt })),
    }));

export const getDefaultVideoStyles = () => cloneVideoStyles(baseVideoStyles);

export const useVideoStyles = (brandId?: number) => {
    const [videoStyles, setVideoStyles] = useState<VideoStyle[]>(() => getDefaultVideoStyles());

    useEffect(() => {
        if (!brandId || brandId === -1) return;

        const fetchBGMs = async () => {
            try {
                const response = await getBGMs({ brand_id: brandId });

                if (response?.code === 200 && response?.data?.background_music) {
                    const bgmOptions: VideoStyleOption[] = response.data.background_music.map(
                        (bgm: { name: string; s3_key: string }) => ({
                            name: bgm.name,
                            url: import.meta.env.VITE_DS_ASSETS_URL + '/' + bgm.s3_key,
                            selected: false,
                            value: bgm.s3_key,
                        })
                    );

                    setVideoStyles(prev =>
                        prev.map(style =>
                            style.field === 'background_music' ? { ...style, options: bgmOptions } : style
                        )
                    );
                }
            } catch (error) {
                console.error('Failed to fetch background music:', error);
            }
        };

        fetchBGMs();
    }, [brandId]);

    const toggleStyleSelection = useCallback((styleIndex: number) => {
        setVideoStyles(prev =>
            prev.map((style, idx) => (idx === styleIndex ? { ...style, selected: !style.selected } : style))
        );
    }, []);

    const toggleOptionSelection = useCallback((styleIndex: number, optionIndex: number) => {
        setVideoStyles(prev =>
            prev.map((style, sIdx) => {
                if (sIdx === styleIndex && style.options) {
                    const updatedOptions = style.options.map((opt, oIdx) => ({
                        ...opt,
                        selected: oIdx === optionIndex ? !opt.selected : false,
                    }));

                    const hasSelectedOption = updatedOptions.some(opt => opt.selected);

                    return {
                        ...style,
                        selected: hasSelectedOption,
                        options: updatedOptions,
                    };
                }
                return style;
            })
        );
    }, []);

    const resetVideoStyles = useCallback(() => {
        setVideoStyles(getDefaultVideoStyles());
    }, []);

    const findStyleByField = useCallback(
        (field: string) => videoStyles.find(style => style.field === field),
        [videoStyles]
    );

    const getSelectedOptionValue = useCallback(
        (field: string) => findStyleByField(field)?.options?.find(opt => opt.selected)?.value || null,
        [findStyleByField]
    );

    const buildVideoGenerationMetadata = useCallback(
        (userEmail?: string, userUUID?: string) => ({
            user_email: userEmail,
            user_uuid: userUUID,
            enhance_image: !!findStyleByField('enhance_images')?.selected,
            add_feature_overlay: !!findStyleByField('feature_overlay')?.selected,
            video_type: getSelectedOptionValue('video_type'),
            bg_music_key: getSelectedOptionValue('background_music'),
            add_avatar: !!findStyleByField('avatar')?.selected,
            captions: getSelectedOptionValue('captions'),
        }),
        [findStyleByField, getSelectedOptionValue]
    );

    return {
        videoStyles,
        toggleStyleSelection,
        toggleOptionSelection,
        resetVideoStyles,
        buildVideoGenerationMetadata,
    };
};
