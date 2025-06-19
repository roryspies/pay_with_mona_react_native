import { useState } from "react";
import { useMonaSdkStore } from "../hooks/useMonaSdkStore";
import { Image, Text } from "react-native";
import { MonaColors } from "../utils/theme";

const MerchantLogo = () => {
    const logo = useMonaSdkStore((state) => state.merchantSdk?.image);
    const name = useMonaSdkStore((state) => state.merchantSdk?.name);
    const [logoError, setLogoError] = useState(!logo);

    if (logo && !logoError) {
        return (
            <Image
                source={{ uri: logo }}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 50,
                    resizeMode: 'cover',
                }}
                onError={() => setLogoError(true)}
            />
        )
    } else {
        return (
            <Text style={{ color: MonaColors.primary }}>{name}</Text>
        )
    }
}

export default MerchantLogo;