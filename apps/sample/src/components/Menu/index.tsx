import { Flex, Icons, Link } from "@ledgerhq/react-ui";
import { useRouter } from "next/navigation";
import styled from "styled-components";

const MenuItem = styled(Flex).attrs({ p: 3, pl: 5 })`
  align-items: center;
`;

const MenuTitle = styled(Link).attrs({
  variant: "paragraph",
  fontWeight: "semiBold",
  ml: 5,
})``;

export const Menu: React.FC = () => {
  const router = useRouter();
  return (
    <>
      <MenuItem>
        <Icons.PlusCircle />
        <MenuTitle>App session</MenuTitle>
      </MenuItem>
      <MenuItem>
        <Icons.LedgerDevices />
        <MenuTitle>Device action</MenuTitle>
      </MenuItem>
      <MenuItem>
        <Icons.WirelessCharging />
        <MenuTitle onClick={() => router.push("/apdu")}>APDU</MenuTitle>
      </MenuItem>
      <MenuItem>
        <Icons.Apps />
        <MenuTitle>Install app</MenuTitle>
      </MenuItem>
    </>
  );
};
