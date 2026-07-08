// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BasePalettePress {
    uint256 public nextPaletteId = 1;

    struct PaletteEntry {
        address author;
        string title;
        string note;
        string colorA;
        string colorB;
        string colorC;
        uint256 createdAt;
    }

    mapping(uint256 => PaletteEntry) private paletteEntries;

    event PalettePublished(
        uint256 indexed paletteId,
        address indexed author,
        string title,
        string note,
        string colorA,
        string colorB,
        string colorC
    );

    function publishPalette(
        string calldata title,
        string calldata note,
        string calldata colorA,
        string calldata colorB,
        string calldata colorC
    ) external returns (uint256 paletteId) {
        require(bytes(title).length > 0 && bytes(title).length <= 24, "Invalid title");
        require(bytes(note).length > 0 && bytes(note).length <= 160, "Invalid note");
        require(_isHexColor(colorA) && _isHexColor(colorB) && _isHexColor(colorC), "Invalid color");

        paletteId = nextPaletteId++;
        paletteEntries[paletteId] = PaletteEntry({
            author: msg.sender,
            title: title,
            note: note,
            colorA: colorA,
            colorB: colorB,
            colorC: colorC,
            createdAt: block.timestamp
        });

        emit PalettePublished(paletteId, msg.sender, title, note, colorA, colorB, colorC);
    }

    function getPalette(
        uint256 paletteId
    )
        external
        view
        returns (
            address author,
            string memory title,
            string memory note,
            string memory colorA,
            string memory colorB,
            string memory colorC,
            uint256 createdAt
        )
    {
        PaletteEntry storage entry = paletteEntries[paletteId];
        return (
            entry.author,
            entry.title,
            entry.note,
            entry.colorA,
            entry.colorB,
            entry.colorC,
            entry.createdAt
        );
    }

    function _isHexColor(string calldata value) internal pure returns (bool) {
        bytes calldata text = bytes(value);
        if (text.length != 7 || text[0] != 0x23) return false;
        for (uint256 i = 1; i < 7; i++) {
            bytes1 char = text[i];
            bool isDigit = char >= 0x30 && char <= 0x39;
            bool isUpperHex = char >= 0x41 && char <= 0x46;
            bool isLowerHex = char >= 0x61 && char <= 0x66;
            if (!(isDigit || isUpperHex || isLowerHex)) return false;
        }
        return true;
    }
}
