/* global kijs */

// --------------------------------------------------------------
// kijs.Char (Static)
// --------------------------------------------------------------

kijs.Char = class kijs_Char {

    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get charTable() {
        return {
            A: [     // capital A
                0x00C1, // Á    capital A with ACUTE
                0x0102, // Ă    capital A with BREVE
                0x1EAE, // Ắ    capital A with BREVE and ACUTE
                0x1EB6, // Ặ    capital A with BREVE and DOT BELOW
                0x1EB0, // Ằ    capital A with BREVE and GRAVE
                0x1EB2, // Ẳ    capital A with BREVE and HOOK ABOVE
                0x1EB4, // Ẵ    capital A with BREVE and TILDE
                0x01CD, // Ǎ    capital A with CARON
                0x00C2, // Â    capital A with CIRCUMFLEX
                0x1EA4, // Ấ    capital A with CIRCUMFLEX and ACUTE
                0x1EAC, // Ậ    capital A with CIRCUMFLEX and DOT BELOW
                0x1EA6, // Ầ    capital A with CIRCUMFLEX and GRAVE
                0x1EA8, // Ẩ    capital A with CIRCUMFLEX and HOOK ABOVE
                0x1EAA, // Ẫ    capital A with CIRCUMFLEX and TILDE
                0x00C4, // Ä    capital A with DIAERESIS
                0x1EA0, // Ạ    capital A with DOT BELOW
                0x00C0, // À    capital A with GRAVE
                0x1EA2, // Ả    capital A with HOOK ABOVE
                0x0100, // Ā    capital A with MACRON
                0x0104, // Ą    capital A with OGONEK
                0x00C5, // Å    capital A with RING ABOVE
                0x01FA, // Ǻ    capital A with RING ABOVE and ACUTE
                0x00C3, // Ã    capital A with TILDE
                0x00C6, // Æ    capital AE
                0x01FC  // Ǽ    capital AE with ACUTE
            ],

            B: [     // capital B
                0x1E04, // Ḅ    capital B with DOT BELOW
                0x0181  // Ɓ    capital B with HOOK
            ],

            C: [     // capital C
                0x0106, // Ć    capital C with ACUTE
                0x010C, // Č    capital C with CARON
                0x00C7, // Ç    capital C with CEDILLA
                0x0108, // Ĉ    capital C with CIRCUMFLEX
                0x010A, // Ċ    capital C with DOT ABOVE
                0x0186, // Ɔ    capital OPEN O
                0x0297  // ʗ    LATIN LETTER STRETCHED C
            ],

            D: [     // capital D
                0x010E, // Ď    capital D with CARON
                0x1E12, // Ḓ    capital D with CIRCUMFLEX BELOW
                0x1E0C, // Ḍ    capital D with DOT BELOW
                0x018A, // Ɗ    capital D with HOOK
                0x1E0E, // Ḏ    capital D with LINE BELOW
                0x01F2, // ǲ    capital D with SMALL LETTER Z
                0x01C5, // ǅ    capital D with SMALL LETTER Z with CARON
                0x0110, // Đ    capital D with STROKE
                0x00D0, // Ð    capital ETH
                0x01F1, // Ǳ    capital DZ
                0x01C4  // Ǆ    capital DZ with CARON
            ],

            E: [     // capital E
                0x00C9, // É    capital E with ACUTE
                0x0114, // Ĕ    capital E with BREVE
                0x011A, // Ě    capital E with CARON
                0x00CA, // Ê    capital E with CIRCUMFLEX
                0x1EBE, // Ế    capital E with CIRCUMFLEX and ACUTE
                0x1EC6, // Ệ    capital E with CIRCUMFLEX and DOT BELOW
                0x1EC0, // Ề    capital E with CIRCUMFLEX and GRAVE
                0x1EC2, // Ể    capital E with CIRCUMFLEX and HOOK ABOVE
                0x1EC4, // Ễ    capital E with CIRCUMFLEX and TILDE
                0x00CB, // Ë    capital E with DIAERESIS
                0x0116, // Ė    capital E with DOT ABOVE
                0x1EB8, // Ẹ    capital E with DOT BELOW
                0x00C8, // È    capital E with GRAVE
                0x1EBA, // Ẻ    capital E with HOOK ABOVE
                0x0112, // Ē    capital E with MACRON
                0x0118, // Ę    capital E with OGONEK
                0x1EBC, // Ẽ    capital E with TILDE
                0x0190, // Ɛ    capital OPEN E
                0x018F  // Ə    capital SCHWA
            ],

            F: [     // capital F
                0x0191  // Ƒ    capital F with HOOK
            ],

            G: [     // capital G
                0x01F4, // Ǵ    capital G with ACUTE
                0x011E, // Ğ    capital G with BREVE
                0x01E6, // Ǧ    capital G with CARON
                0x0122, // Ģ    capital G with CEDILLA
                0x011C, // Ĝ    capital G with CIRCUMFLEX
                0x0120, // Ġ    capital G with DOT ABOVE
                0x1E20, // Ḡ    capital G with MACRON
                0x029B  // ʛ    LATIN LETTER SMALL CAPITAL G with HOOK
            ],

            H: [     // capital H
                0x1E2A, // Ḫ    capital H with BREVE BELOW
                0x0124, // Ĥ    capital H with CIRCUMFLEX
                0x1E24, // Ḥ    capital H with DOT BELOW
                0x0126  // Ħ    capital H with STROKE
            ],

            I: [     // capital I
                0x00CD, // Í    capital I with ACUTE
                0x012C, // Ĭ    capital I with BREVE
                0x01CF, // Ǐ    capital I with CARON
                0x00CE, // Î    capital I with CIRCUMFLEX
                0x00CF, // Ï    capital I with DIAERESIS
                0x0130, // İ    capital I with DOT ABOVE
                0x1ECA, // Ị    capital I with DOT BELOW
                0x00CC, // Ì    capital I with GRAVE
                0x1EC8, // Ỉ    capital I with HOOK ABOVE
                0x012A, // Ī    capital I with MACRON
                0x012E, // Į    capital I with OGONEK
                0x0128, // Ĩ    capital I with TILDE
                0x0132  // Ĳ    LATIN CAPITAL LIGATURE IJ
            ],

            J: [     // capital J
                0x0134  // Ĵ    capital J with CIRCUMFLEX
            ],

            K: [     // capital K
                0x0136, // Ķ    capital K with CEDILLA
                0x1E32, // Ḳ    capital K with DOT BELOW
                0x0198, // Ƙ    capital K with HOOK
                0x1E34  // Ḵ    capital K with LINE BELOW
            ],

            L: [     // capital L
                0x0139, // Ĺ    capital L with ACUTE
                0x023D, // Ƚ    capital L with BAR
                0x013D, // Ľ    capital L with CARON
                0x013B, // Ļ    capital L with CEDILLA
                0x1E3C, // Ḽ    capital L with CIRCUMFLEX BELOW
                0x1E36, // Ḷ    capital L with DOT BELOW
                0x1E38, // Ḹ    capital L with DOT BELOW and MACRON
                0x1E3A, // Ḻ    capital L with LINE BELOW
                0x013F, // Ŀ    capital L with MIDDLE DOT
                0x01C8, // ǈ    capital L with SMALL LETTER J
                0x0141, // Ł    capital L with STROKE
                0x01C7  // Ǉ    capital LJ
            ],

            M: [     // capital M
                0x1E3E, // Ḿ    capital M with ACUTE
                0x1E40, // Ṁ    capital M with DOT ABOVE
                0x1E42  // Ṃ    capital M with DOT BELOW
            ],

            N: [     // capital N
                0x0143, // Ń    capital N with ACUTE
                0x0147, // Ň    capital N with CARON
                0x0145, // Ņ    capital N with CEDILLA
                0x1E4A, // Ṋ    capital N with CIRCUMFLEX BELOW
                0x1E44, // Ṅ    capital N with DOT ABOVE
                0x1E46, // Ṇ    capital N with DOT BELOW
                0x01F8, // Ǹ    capital N with GRAVE
                0x019D, // Ɲ    capital N with LEFT HOOK
                0x1E48, // Ṉ    capital N with LINE BELOW
                0x01CB, // ǋ    capital N with SMALL LETTER J
                0x00D1, // Ñ    capital N with TILDE
                0x01CA  // Ǌ    capital NJ
            ],

            O: [     // capital O
                0x00D3, // Ó    capital O with ACUTE
                0x014E, // Ŏ    capital O with BREVE
                0x01D1, // Ǒ    capital O with CARON
                0x00D4, // Ô    capital O with CIRCUMFLEX
                0x1ED0, // Ố    capital O with CIRCUMFLEX and ACUTE
                0x1ED8, // Ộ    capital O with CIRCUMFLEX and DOT BELOW
                0x1ED2, // Ồ    capital O with CIRCUMFLEX and GRAVE
                0x1ED4, // Ổ    capital O with CIRCUMFLEX and HOOK ABOVE
                0x1ED6, // Ỗ    capital O with CIRCUMFLEX and TILDE
                0x00D6, // Ö    capital O with DIAERESIS
                0x1ECC, // Ọ    capital O with DOT BELOW
                0x0150, // Ő    capital O with DOUBLE ACUTE
                0x00D2, // Ò    capital O with GRAVE
                0x1ECE, // Ỏ    capital O with HOOK ABOVE
                0x01A0, // Ơ    capital O with HORN
                0x1EDA, // Ớ    capital O with HORN and ACUTE
                0x1EE2, // Ợ    capital O with HORN and DOT BELOW
                0x1EDC, // Ờ    capital O with HORN and GRAVE
                0x1EDE, // Ở    capital O with HORN and HOOK ABOVE
                0x1EE0, // Ỡ    capital O with HORN and TILDE
                0x014C, // Ō    capital O with MACRON
                0x019F, // Ɵ    capital O with MIDDLE TILDE
                0x01EA, // Ǫ    capital O with OGONEK
                0x00D8, // Ø    capital O with STROKE
                0x01FE, // Ǿ    capital O with STROKE and ACUTE
                0x00D5, // Õ    capital O with TILDE
                0x0152, // Œ    LATIN CAPITAL LIGATURE OE
                0x0276  // ɶ    LATIN LETTER SMALL CAPITAL OE
            ],

            P: [     // capital P
                0x00DE  // Þ    capital THORN
            ],

            Q: [     // capital Q
            ],

            R: [     // capital R
                0x0154, // Ŕ    capital R with ACUTE
                0x0158, // Ř    capital R with CARON
                0x0156, // Ŗ    capital R with CEDILLA
                0x1E58, // Ṙ    capital R with DOT ABOVE
                0x1E5A, // Ṛ    capital R with DOT BELOW
                0x1E5C, // Ṝ    capital R with DOT BELOW and MACRON
                0x1E5E, // Ṟ    capital R with LINE BELOW
                0x0281  // ʁ    LATIN LETTER SMALL CAPITAL INVERTED R
            ],

            S: [     // capital S
                0x015A, // Ś    capital S with ACUTE
                0x0160, // Š    capital S with CARON
                0x015E, // Ş    capital S with CEDILLA
                0x015C, // Ŝ    capital S with CIRCUMFLEX
                0x0218, // Ș    capital S with COMMA BELOW
                0x1E60, // Ṡ    capital S with DOT ABOVE
                0x1E62, // Ṣ    capital S with DOT BELOW
                0x1E9E  // ẞ    capital SHARP S
            ],

            T: [     // capital T
                0x0164, // Ť    capital T with CARON
                0x0162, // Ţ    capital T with CEDILLA
                0x1E70, // Ṱ    capital T with CIRCUMFLEX BELOW
                0x021A, // Ț    capital T with COMMA BELOW
                0x1E6C, // Ṭ    capital T with DOT BELOW
                0x1E6E, // Ṯ    capital T with LINE BELOW
                0x0166, // Ŧ    capital T with STROKE
                0x00DE, // Þ    capital THORN
                0x00D0  // Ð    capital ETH
            ],

            U: [     // capital U
                0x00DA, // Ú    capital U with ACUTE
                0x016C, // Ŭ    capital U with BREVE
                0x01D3, // Ǔ    capital U with CARON
                0x00DB, // Û    capital U with CIRCUMFLEX
                0x00DC, // Ü    capital U with DIAERESIS
                0x01D7, // Ǘ    capital U with DIAERESIS and ACUTE
                0x01D9, // Ǚ    capital U with DIAERESIS and CARON
                0x01DB, // Ǜ    capital U with DIAERESIS and GRAVE
                0x01D5, // Ǖ    capital U with DIAERESIS and MACRON
                0x1EE4, // Ụ    capital U with DOT BELOW
                0x0170, // Ű    capital U with DOUBLE ACUTE
                0x00D9, // Ù    capital U with GRAVE
                0x1EE6, // Ủ    capital U with HOOK ABOVE
                0x01AF, // Ư    capital U with HORN
                0x1EE8, // Ứ    capital U with HORN and ACUTE
                0x1EF0, // Ự    capital U with HORN and DOT BELOW
                0x1EEA, // Ừ    capital U with HORN and GRAVE
                0x1EEC, // Ử    capital U with HORN and HOOK ABOVE
                0x1EEE, // Ữ    capital U with HORN and TILDE
                0x016A, // Ū    capital U with MACRON
                0x0172, // Ų    capital U with OGONEK
                0x016E, // Ů    capital U with RING ABOVE
                0x0168  // Ũ    capital U with TILDE
            ],

            V: [     // capital V
            ],

            W: [     // capital W
                0x1E82, // Ẃ    capital W with ACUTE
                0x0174, // Ŵ    capital W with CIRCUMFLEX
                0x1E84, // Ẅ    capital W with DIAERESIS
                0x1E80, // Ẁ    capital W with GRAVE
                0x02AC  // ʬ    LATIN LETTER BILABIAL PERCUSSIVE
            ],

            X: [     // capital X
            ],

            Y: [     // capital Y
                0x00DD, // Ý    capital Y with ACUTE
                0x0176, // Ŷ    capital Y with CIRCUMFLEX
                0x0178, // Ÿ    capital Y with DIAERESIS
                0x1E8E, // Ẏ    capital Y with DOT ABOVE
                0x1EF4, // Ỵ    capital Y with DOT BELOW
                0x1EF2, // Ỳ    capital Y with GRAVE
                0x01B3, // Ƴ    capital Y with HOOK
                0x1EF6, // Ỷ    capital Y with HOOK ABOVE
                0x0232, // Ȳ    capital Y with MACRON
                0x1EF8  // Ỹ    capital Y with TILDE
            ],

            Z: [     // capital Z
                0x0179, // Ź    capital Z with ACUTE
                0x017D, // Ž    capital Z with CARON
                0x017B, // Ż    capital Z with DOT ABOVE
                0x1E92, // Ẓ    capital Z with DOT BELOW
                0x1E94, // Ẕ    capital Z with LINE BELOW
                0x01B5  // Ƶ    capital Z with STROKE
            ],

            a: [     // lowercase A
                0x00E1, // á    lowercase A with ACUTE
                0x0103, // ă    lowercase A with BREVE
                0x1EAF, // ắ    lowercase A with BREVE and ACUTE
                0x1EB7, // ặ    lowercase A with BREVE and DOT BELOW
                0x1EB1, // ằ    lowercase A with BREVE and GRAVE
                0x1EB3, // ẳ    lowercase A with BREVE and HOOK ABOVE
                0x1EB5, // ẵ    lowercase A with BREVE and TILDE
                0x01CE, // ǎ    lowercase A with CARON
                0x00E2, // â    lowercase A with CIRCUMFLEX
                0x1EA5, // ấ    lowercase A with CIRCUMFLEX and ACUTE
                0x1EAD, // ậ    lowercase A with CIRCUMFLEX and DOT BELOW
                0x1EA7, // ầ    lowercase A with CIRCUMFLEX and GRAVE
                0x1EA9, // ẩ    lowercase A with CIRCUMFLEX and HOOK ABOVE
                0x1EAB, // ẫ    lowercase A with CIRCUMFLEX and TILDE
                0x00E4, // ä    lowercase A with DIAERESIS
                0x1EA1, // ạ    lowercase A with DOT BELOW
                0x00E0, // à    lowercase A with GRAVE
                0x1EA3, // ả    lowercase A with HOOK ABOVE
                0x0101, // ā    lowercase A with MACRON
                0x0105, // ą    lowercase A with OGONEK
                0x00E5, // å    lowercase A with RING ABOVE
                0x01FB, // ǻ    lowercase A with RING ABOVE and ACUTE
                0x00E3, // ã    lowercase A with TILDE
                0x00E6, // æ    lowercase AE
                0x01FD, // ǽ    lowercase AE with ACUTE
                0x0251, // ɑ    lowercase ALPHA
                0x0250, // ɐ    lowercase TURNED A
                0x0252  // ɒ    lowercase TURNED ALPHA
            ],

            b: [     // lowercase B
                0x1E05, // ḅ    lowercase B with DOT BELOW
                0x0253, // ɓ    lowercase B with HOOK
                0x00DF  // ß    lowercase SHARP S
            ],

            c: [     // lowercase C
                0x0107, // ć    lowercase C with ACUTE
                0x010D, // č    lowercase C with CARON
                0x00E7, // ç    lowercase C with CEDILLA
                0x0109, // ĉ    lowercase C with CIRCUMFLEX
                0x0255, // ɕ    lowercase C with CURL
                0x010B  // ċ    lowercase C with DOT ABOVE
            ],

            d: [     // lowercase D
                0x010F, // ď    lowercase D with CARON
                0x1E13, // ḓ    lowercase D with CIRCUMFLEX BELOW
                0x1E0D, // ḍ    lowercase D with DOT BELOW
                0x0257, // ɗ    lowercase D with HOOK
                0x1E0F, // ḏ    lowercase D with LINE BELOW
                0x0111, // đ    lowercase D with STROKE
                0x0256, // ɖ    lowercase D with TAIL
                0x02A4, // ʤ    lowercase DEZH DIGRAPH
                0x01F3, // ǳ    lowercase DZ
                0x02A3, // ʣ    lowercase DZ DIGRAPH
                0x02A5, // ʥ    lowercase DZ DIGRAPH with CURL
                0x01C6, // ǆ    lowercase DZ with CARON
                0x00F0  // ð    lowercase ETH
            ],

            e: [     // lowercase E
                0x00E9, // é    lowercase E with ACUTE
                0x0115, // ĕ    lowercase E with BREVE
                0x011B, // ě    lowercase E with CARON
                0x00EA, // ê    lowercase E with CIRCUMFLEX
                0x1EBF, // ế    lowercase E with CIRCUMFLEX and ACUTE
                0x1EC7, // ệ    lowercase E with CIRCUMFLEX and DOT BELOW
                0x1EC1, // ề    lowercase E with CIRCUMFLEX and GRAVE
                0x1EC3, // ể    lowercase E with CIRCUMFLEX and HOOK ABOVE
                0x1EC5, // ễ    lowercase E with CIRCUMFLEX and TILDE
                0x00EB, // ë    lowercase E with DIAERESIS
                0x0117, // ė    lowercase E with DOT ABOVE
                0x1EB9, // ẹ    lowercase E with DOT BELOW
                0x00E8, // è    lowercase E with GRAVE
                0x1EBB, // ẻ    lowercase E with HOOK ABOVE
                0x0113, // ē    lowercase E with MACRON
                0x0119, // ę    lowercase E with OGONEK
                0x1EBD, // ẽ    lowercase E with TILDE
                0x0292, // ʒ    lowercase EZH
                0x01EF, // ǯ    lowercase EZH with CARON
                0x0293, // ʓ    lowercase EZH with CURL
                0x0258, // ɘ    lowercase REVERSED E
                0x025C, // ɜ    lowercase REVERSED OPEN E
                0x025D, // ɝ    lowercase REVERSED OPEN E with HOOK
                0x0259, // ə    lowercase SCHWA
                0x025A, // ɚ    lowercase SCHWA with HOOK
                0x029A, // ʚ    lowercase CLOSED OPEN E
                0x025E  // ɞ    lowercase CLOSED REVERSED OPEN E
            ],

            f: [     // lowercase F
                0x0192, // ƒ    lowercase F with HOOK
                0x017F, // ſ    lowercase LONG S
                0x02A9, // ʩ    lowercase FENG DIGRAPH
                0xFB01, // ﬁ    LATIN SMALL LIGATURE FI
                0xFB02, // ﬂ    LATIN SMALL LIGATURE FL
                0x0283, // ʃ    lowercase ESH
                0x0286, // ʆ    lowercase ESH with CURL
                0x0285, // ʅ    lowercase SQUAT REVERSED ESH
                0x025F, // ɟ    lowercase DOTLESS J with STROKE
                0x0284  // ʄ    lowercase DOTLESS J with STROKE and HOOK
            ],

            g: [     // lowercase G
                0x01F5, // ǵ    lowercase G with ACUTE
                0x011F, // ğ    lowercase G with BREVE
                0x01E7, // ǧ    lowercase G with CARON
                0x0123, // ģ    lowercase G with CEDILLA
                0x011D, // ĝ    lowercase G with CIRCUMFLEX
                0x0121, // ġ    lowercase G with DOT ABOVE
                0x0260, // ɠ    lowercase G with HOOK
                0x1E21, // ḡ    lowercase G with MACRON
                0x0261, // ɡ    lowercase SCRIPT G
                0x0263  // ɣ    lowercase GAMMA
            ],

            h: [     // lowercase H
                0x1E2B, // ḫ    lowercase H with BREVE BELOW
                0x0125, // ĥ    lowercase H with CIRCUMFLEX
                0x1E25, // ḥ    lowercase H with DOT BELOW
                0x0266, // ɦ    lowercase H with HOOK
                0x1E96, // ẖ    lowercase H with LINE BELOW
                0x0127, // ħ    lowercase H with STROKE
                0x0267, // ɧ    lowercase HENG with HOOK
                0x0265, // ɥ    lowercase TURNED H
                0x02AE, // ʮ    lowercase TURNED H with FISHHOOK
                0x02AF, // ʯ    lowercase TURNED H with FISHHOOK and TAIL
                0x0173  // ų    lowercase U with OGONEK
            ],

            i: [     // lowercase I
                0x00ED, // í    lowercase I with ACUTE
                0x012D, // ĭ    lowercase I with BREVE
                0x01D0, // ǐ    lowercase I with CARON
                0x00EE, // î    lowercase I with CIRCUMFLEX
                0x00EF, // ï    lowercase I with DIAERESIS
                0x1ECB, // ị    lowercase I with DOT BELOW
                0x00EC, // ì    lowercase I with GRAVE
                0x1EC9, // ỉ    lowercase I with HOOK ABOVE
                0x012B, // ī    lowercase I with MACRON
                0x012F, // į    lowercase I with OGONEK
                0x0268, // ɨ    lowercase I with STROKE
                0x0129, // ĩ    lowercase I with TILDE
                0x0269, // ɩ    lowercase IOTA
                0x0131, // ı    lowercase DOTLESS I
                0x0133, // ĳ    LATIN SMALL LIGATURE IJ
                0x025F  // ɟ    lowercase DOTLESS J with STROKE
            ],

            j: [     // lowercase J
                0x01F0, // ǰ    lowercase J with CARON
                0x0135, // ĵ    lowercase J with CIRCUMFLEX
                0x029D, // ʝ    lowercase J with CROSSED-TAIL
                0x0237, // ȷ    lowercase DOTLESS J
                0x025F, // ɟ    lowercase DOTLESS J with STROKE
                0x0284  // ʄ    lowercase DOTLESS J with STROKE and HOOK
            ],

            k: [     // lowercase K
                0x0137, // ķ    lowercase K with CEDILLA
                0x1E33, // ḳ    lowercase K with DOT BELOW
                0x0199, // ƙ    lowercase K with HOOK
                0x1E35, // ḵ    lowercase K with LINE BELOW
                0x0138, // ĸ    lowercase KRA
                0x029E  // ʞ    lowercase TURNED K
            ],

            l: [     // lowercase L
                0x013A, // ĺ    lowercase L with ACUTE
                0x019A, // ƚ    lowercase L with BAR
                0x026C, // ɬ    lowercase L with BELT
                0x013E, // ľ    lowercase L with CARON
                0x013C, // ļ    lowercase L with CEDILLA
                0x1E3D, // ḽ    lowercase L with CIRCUMFLEX BELOW
                0x1E37, // ḷ    lowercase L with DOT BELOW
                0x1E39, // ḹ    lowercase L with DOT BELOW and MACRON
                0x1E3B, // ḻ    lowercase L with LINE BELOW
                0x0140, // ŀ    lowercase L with MIDDLE DOT
                0x026B, // ɫ    lowercase L with MIDDLE TILDE
                0x026D, // ɭ    lowercase L with RETROFLEX HOOK
                0x0142, // ł    lowercase L with STROKE
                0x019B, // ƛ    lowercase LAMBDA with STROKE
                0x026E, // ɮ    lowercase LEZH
                0x01C9, // ǉ    lowercase LJ
                0x02AA, // ʪ    lowercase LS DIGRAPH
                0x02AB  // ʫ    lowercase LZ DIGRAPH
            ],

            m: [     // lowercase M
                0x1E3F, // ḿ    lowercase M with ACUTE
                0x1E41, // ṁ    lowercase M with DOT ABOVE
                0x1E43, // ṃ    lowercase M with DOT BELOW
                0x0271, // ɱ    lowercase M with HOOK
                0x026F, // ɯ    lowercase TURNED M
                0x0270  // ɰ    lowercase TURNED M with LONG LEG
            ],

            n: [     // lowercase N
                0x0149, // ŉ    lowercase N PRECEDED BY APOSTROPHE
                0x0144, // ń    lowercase N with ACUTE
                0x0148, // ň    lowercase N with CARON
                0x0146, // ņ    lowercase N with CEDILLA
                0x1E4B, // ṋ    lowercase N with CIRCUMFLEX BELOW
                0x1E45, // ṅ    lowercase N with DOT ABOVE
                0x1E47, // ṇ    lowercase N with DOT BELOW
                0x01F9, // ǹ    lowercase N with GRAVE
                0x0272, // ɲ    lowercase N with LEFT HOOK
                0x1E49, // ṉ    lowercase N with LINE BELOW
                0x0273, // ɳ    lowercase N with RETROFLEX HOOK
                0x00F1, // ñ    lowercase N with TILDE
                0x01CC, // ǌ    lowercase NJ
                0x014B, // ŋ    lowercase ENG
                0x014A  // Ŋ    capital ENG
            ],

            o: [     // lowercase O
                0x00F3, // ó    lowercase O with ACUTE
                0x014F, // ŏ    lowercase O with BREVE
                0x01D2, // ǒ    lowercase O with CARON
                0x00F4, // ô    lowercase O with CIRCUMFLEX
                0x1ED1, // ố    lowercase O with CIRCUMFLEX and ACUTE
                0x1ED9, // ộ    lowercase O with CIRCUMFLEX and DOT BELOW
                0x1ED3, // ồ    lowercase O with CIRCUMFLEX and GRAVE
                0x1ED5, // ổ    lowercase O with CIRCUMFLEX and HOOK ABOVE
                0x1ED7, // ỗ    lowercase O with CIRCUMFLEX and TILDE
                0x00F6, // ö    lowercase O with DIAERESIS
                0x1ECD, // ọ    lowercase O with DOT BELOW
                0x0151, // ő    lowercase O with DOUBLE ACUTE
                0x00F2, // ò    lowercase O with GRAVE
                0x1ECF, // ỏ    lowercase O with HOOK ABOVE
                0x01A1, // ơ    lowercase O with HORN
                0x1EDB, // ớ    lowercase O with HORN and ACUTE
                0x1EE3, // ợ    lowercase O with HORN and DOT BELOW
                0x1EDD, // ờ    lowercase O with HORN and GRAVE
                0x1EDF, // ở    lowercase O with HORN and HOOK ABOVE
                0x1EE1, // ỡ    lowercase O with HORN and TILDE
                0x014D, // ō    lowercase O with MACRON
                0x01EB, // ǫ    lowercase O with OGONEK
                0x00F8, // ø    lowercase O with STROKE
                0x01FF, // ǿ    lowercase O with STROKE and ACUTE
                0x00F5, // õ    lowercase O with TILDE
                0x025B, // ɛ    lowercase OPEN E
                0x0254, // ɔ    lowercase OPEN O
                0x0275, // ɵ    lowercase BARRED O
                0x0298, // ʘ    LATIN LETTER BILABIAL CLICK
                0x0153  // œ    LATIN SMALL LIGATURE OE
            ],

            p: [     // lowercase P
                0x0278, // ɸ    lowercase PHI
                0x00FE  // þ    lowercase THORN
            ],

            q: [     // lowercase Q
                0x02A0  // ʠ    lowercase Q with HOOK
            ],

            r: [     // lowercase R
                0x0155, // ŕ    lowercase R with ACUTE
                0x0159, // ř    lowercase R with CARON
                0x0157, // ŗ    lowercase R with CEDILLA
                0x1E59, // ṙ    lowercase R with DOT ABOVE
                0x1E5B, // ṛ    lowercase R with DOT BELOW
                0x1E5D, // ṝ    lowercase R with DOT BELOW and MACRON
                0x027E, // ɾ    lowercase R with FISHHOOK
                0x1E5F, // ṟ    lowercase R with LINE BELOW
                0x027C, // ɼ    lowercase R with LONG LEG
                0x027D, // ɽ    lowercase R with TAIL
                0x027F, // ɿ    lowercase REVERSED R with FISHHOOK
                0x0279, // ɹ    lowercase TURNED R
                0x027B, // ɻ    lowercase TURNED R with HOOK
                0x027A  // ɺ    lowercase TURNED R with LONG LEG
            ],

            s: [     // lowercase S
                0x015B, // ś    lowercase S with ACUTE
                0x0161, // š    lowercase S with CARON
                0x015F, // ş    lowercase S with CEDILLA
                0x015D, // ŝ    lowercase S with CIRCUMFLEX
                0x0219, // ș    lowercase S with COMMA BELOW
                0x1E61, // ṡ    lowercase S with DOT ABOVE
                0x1E63, // ṣ    lowercase S with DOT BELOW
                0x0282, // ʂ    lowercase S with HOOK
                0x017F, // ſ    lowercase LONG S
                0x0283, // ʃ    lowercase ESH
                0x0286, // ʆ    lowercase ESH with CURL
                0x00DF, // ß    lowercase SHARP S
                0x0285  // ʅ    lowercase SQUAT REVERSED ESH
            ],

            t: [     // lowercase T
                0x0165, // ť    lowercase T with CARON
                0x0163, // ţ    lowercase T with CEDILLA
                0x1E71, // ṱ    lowercase T with CIRCUMFLEX BELOW
                0x021B, // ț    lowercase T with COMMA BELOW
                0x1E97, // ẗ    lowercase T with DIAERESIS
                0x1E6D, // ṭ    lowercase T with DOT BELOW
                0x1E6F, // ṯ    lowercase T with LINE BELOW
                0x0288, // ʈ    lowercase T with RETROFLEX HOOK
                0x0167, // ŧ    lowercase T with STROKE
                0x02A8, // ʨ    lowercase TC DIGRAPH with CURL
                0x02A7, // ʧ    lowercase TESH DIGRAPH
                0x00FE, // þ    lowercase THORN
                0x00F0, // ð    lowercase ETH
                0x02A6, // ʦ    lowercase TS DIGRAPH
                0x0287  // ʇ    lowercase TURNED T
            ],

            u: [     // lowercase U
                0x0289, // ʉ    lowercase U BAR
                0x00FA, // ú    lowercase U with ACUTE
                0x016D, // ŭ    lowercase U with BREVE
                0x01D4, // ǔ    lowercase U with CARON
                0x00FB, // û    lowercase U with CIRCUMFLEX
                0x00FC, // ü    lowercase U with DIAERESIS
                0x01D8, // ǘ    lowercase U with DIAERESIS and ACUTE
                0x01DA, // ǚ    lowercase U with DIAERESIS and CARON
                0x01DC, // ǜ    lowercase U with DIAERESIS and GRAVE
                0x01D6, // ǖ    lowercase U with DIAERESIS and MACRON
                0x1EE5, // ụ    lowercase U with DOT BELOW
                0x0171, // ű    lowercase U with DOUBLE ACUTE
                0x00F9, // ù    lowercase U with GRAVE
                0x1EE7, // ủ    lowercase U with HOOK ABOVE
                0x01B0, // ư    lowercase U with HORN
                0x1EE9, // ứ    lowercase U with HORN and ACUTE
                0x1EF1, // ự    lowercase U with HORN and DOT BELOW
                0x1EEB, // ừ    lowercase U with HORN and GRAVE
                0x1EED, // ử    lowercase U with HORN and HOOK ABOVE
                0x1EEF, // ữ    lowercase U with HORN and TILDE
                0x016B, // ū    lowercase U with MACRON
                0x0173, // ų    lowercase U with OGONEK
                0x016F, // ů    lowercase U with RING ABOVE
                0x0169, // ũ    lowercase U with TILDE
                0x028A  // ʊ    lowercase UPSILON
            ],

            v: [     // lowercase V
                0x028B, // ʋ    lowercase V with HOOK
                0x028C  // ʌ    lowercase TURNED V
            ],

            w: [     // lowercase W
                0x1E83, // ẃ    lowercase W with ACUTE
                0x0175, // ŵ    lowercase W with CIRCUMFLEX
                0x1E85, // ẅ    lowercase W with DIAERESIS
                0x1E81, // ẁ    lowercase W with GRAVE
                0x028D  // ʍ    lowercase TURNED W
            ],

            x: [     // lowercase X
            ],

            y: [     // lowercase Y
                0x00FD, // ý    lowercase Y with ACUTE
                0x0177, // ŷ    lowercase Y with CIRCUMFLEX
                0x00FF, // ÿ    lowercase Y with DIAERESIS
                0x1E8F, // ẏ    lowercase Y with DOT ABOVE
                0x1EF5, // ỵ    lowercase Y with DOT BELOW
                0x1EF3, // ỳ    lowercase Y with GRAVE
                0x01B4, // ƴ    lowercase Y with HOOK
                0x1EF7, // ỷ    lowercase Y with HOOK ABOVE
                0x0233, // ȳ    lowercase Y with MACRON
                0x1EF9, // ỹ    lowercase Y with TILDE
                0x028E  // ʎ    lowercase TURNED Y
            ],

            z: [     // lowercase Z
                0x017A, // ź    lowercase Z with ACUTE
                0x017E, // ž    lowercase Z with CARON
                0x0291, // ʑ    lowercase Z with CURL
                0x017C, // ż    lowercase Z with DOT ABOVE
                0x1E93, // ẓ    lowercase Z with DOT BELOW
                0x1E95, // ẕ    lowercase Z with LINE BELOW
                0x0290, // ʐ    lowercase Z with RETROFLEX HOOK
                0x01B6  // ƶ    lowercase Z with STROKE
            ]
        };
    };


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    /**
     * Returns a RegExp String with every letter (a-zA-Z) replaced with all variants of this letter.
     * Ex.: 'a' => '[aáăắặằẳẵǎâấậầẩẫäạàảāąåǻãæǽɑɐɒ]'
     * @param {String} text
     * @returns {String}
     */
    static getRegexPattern(text) {

        // String in Buchstabenarray aufteilen
        let letters = null;
        if (kijs.isFunction(Array.from)) {
            letters = Array.from(text);
            
        } else { // Fallback für IE
            letters = text.split('');
        }

        let regex = '';
        kijs.Array.each(letters, function(letter) {
            if (kijs.isArray(kijs.Char.charTable[letter]) && kijs.Char.charTable[letter].length > 0) {
                regex += '[' + letter;
                kijs.Array.each(kijs.Char.charTable[letter], function(specialLetter) {
                    regex += String.fromCodePoint ? String.fromCodePoint(specialLetter) : String.fromCharCode(specialLetter);
                }, this);
                regex += ']';
            } else {
                regex += '' + letter;
            }
        }, this);

        return regex;
    }

    /**
     * Replaces special chars with their base char (öüä => oua).
     * @param {String} text
     * @returns {String}
     */
    static replaceSpecialChars(text) {

        // String in Buchstabenarray aufteilen
        let letters = null;
        if (kijs.isFunction(Array.from)) {
            letters = Array.from(text);
        } else { // Fallback für IE
            letters = text.split('');
        }

        let responseText = '';
        kijs.Array.each(letters, function(letter) {
           for (let char in kijs.Char.charTable) {
               if (kijs.Array.contains(kijs.Char.charTable[char], letter.codePointAt ? letter.codePointAt(0) : letter.charCodeAt(0))) {
                   responseText += char;
                   return;
               }
           }

           // no match
           responseText += letter;
        });

        return responseText;
    }
};