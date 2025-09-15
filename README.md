# GAIA Equalizer React Native

Este é um aplicativo React Native que implementa um equalizador personalizado usando o protocolo GAIA da Qualcomm, baseado no SDK Android GAIA Control 3.4.0.52.

## Funcionalidades

- **Conexão Bluetooth Classic**: Conecta-se a dispositivos GAIA via Bluetooth Classic
- **Equalizador Personalizado**: Interface completa para configuração de equalizador com:
  - 5 bandas configuráveis (band 1-5)
  - Master Gain global
  - 13 tipos de filtros diferentes:
    - BYPASS, LPF1, LPF2, HPF1, HPF2, APF1, APF2
    - LS1, LS2, HS1, HS2, Tilt1, Tilt2, PEQ
  - Parâmetros ajustáveis por filtro:
    - Frequência (Frequency)
    - Ganho (Gain)
    - Qualidade (Quality)
- **Protocolo GAIA**: Implementação completa dos comandos GAIA para equalização
- **Interface Intuitiva**: Interface baseada no design do aplicativo Android original

## Estrutura do Projeto

```
src/
├── components/
│   ├── Bluetooth/
│   │   └── BluetoothConnectionScreen.js    # Tela de conexão Bluetooth
│   └── Equalizer/
│       ├── EqualizerScreen.js              # Tela principal do equalizador
│       ├── EqualizerSlider.js              # Componente de slider
│       ├── FilterButton.js                 # Botão de seleção de filtro
│       └── BandButton.js                   # Botão de seleção de banda
├── services/
│   ├── BluetoothService.js                 # Serviço de Bluetooth Classic
│   └── GAIAProtocol.js                     # Implementação do protocolo GAIA
├── models/
│   └── Equalizer/
│       ├── Bank.js                         # Classe Bank (banco de equalização)
│       ├── Band.js                         # Classe Band (banda individual)
│       ├── Parameter.js                    # Classe base para parâmetros
│       ├── Frequency.js                    # Parâmetro de frequência
│       ├── Gain.js                         # Parâmetro de ganho
│       ├── Quality.js                      # Parâmetro de qualidade
│       ├── MasterGain.js                   # Parâmetro de master gain
│       └── Filter.js                       # Definições de filtros
├── constants/
│   └── GAIACommands.js                     # Constantes do protocolo GAIA
└── utils/
    └── GAIACommands.js                     # Utilitários para comandos GAIA
```

## Comandos GAIA Implementados

### Equalizador

- `COMMAND_SET_EQ_CONTROL` (0x0214) - Define preset do equalizador
- `COMMAND_GET_EQ_CONTROL` (0x0294) - Obtém preset atual
- `COMMAND_SET_EQ_PARAMETER` (0x021A) - Define parâmetro de equalização
- `COMMAND_GET_EQ_PARAMETER` (0x029A) - Obtém parâmetro de equalização

### Parâmetros Suportados

- **Master Gain**: Ganho global do equalizador (-36dB a +12dB)
- **Filtros por Banda**:
  - **Frequência**: 0.3Hz a 20kHz (dependendo do filtro)
  - **Ganho**: -36dB a +12dB (dependendo do filtro)
  - **Qualidade**: 0.25 a 8.0 (dependendo do filtro)

## Tipos de Filtros

| Filtro | Frequência  | Ganho         | Qualidade | Descrição            |
| ------ | ----------- | ------------- | --------- | -------------------- |
| BYPASS | -           | -             | -         | Sem processamento    |
| LPF1   | 0.3Hz-20kHz | -             | -         | Low Pass 1ª ordem    |
| LPF2   | 40Hz-20kHz  | -             | 0.25-2.0  | Low Pass 2ª ordem    |
| HPF1   | 0.3Hz-20kHz | -             | -         | High Pass 1ª ordem   |
| HPF2   | 40Hz-20kHz  | -             | 0.25-2.0  | High Pass 2ª ordem   |
| APF1   | 0.3Hz-20kHz | -             | -         | All Pass 1ª ordem    |
| APF2   | 40Hz-20kHz  | -             | 0.25-2.0  | All Pass 2ª ordem    |
| LS1    | 20Hz-20kHz  | -12dB a +12dB | -         | Low Shelf 1ª ordem   |
| LS2    | 40Hz-20kHz  | -12dB a +12dB | 0.25-2.0  | Low Shelf 2ª ordem   |
| HS1    | 20Hz-20kHz  | -12dB a +12dB | -         | High Shelf 1ª ordem  |
| HS2    | 40Hz-20kHz  | -12dB a +12dB | 0.25-2.0  | High Shelf 2ª ordem  |
| Tilt1  | 20Hz-20kHz  | -12dB a +12dB | -         | Tilt 1ª ordem        |
| Tilt2  | 40Hz-20kHz  | -12dB a +12dB | 0.25-2.0  | Tilt 2ª ordem        |
| PEQ    | 20Hz-20kHz  | -36dB a +12dB | 0.25-8.0  | Parametric Equalizer |

## Instalação

### Pré-requisitos

- Node.js (versão 16 ou superior)
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS)

### Instalação Rápida

1. **Instalar dependências:**

```bash
npm install
```

2. **Compilar e executar (Android):**

```bash
# Opção 1: Usar o script de build
./build.sh

# Opção 2: Comando manual
npx react-native run-android
```

3. **Para iOS:**

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### Scripts Disponíveis

- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run start` - Inicia o Metro bundler
- `npm run lint` - Verifica erros de código
- `npm run lint:fix` - Corrige erros automaticamente
- `npm test` - Executa testes

### Build de Produção

```bash
# Android
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# iOS
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle
```

## Dependências

- `react-native-bluetooth-serial`: Comunicação Bluetooth Classic
- `react-native-permissions`: Gerenciamento de permissões
- `@react-native-community/slider`: Componente de slider

## Uso

1. **Conectar Dispositivo**:

   - Abra o aplicativo
   - Certifique-se de que o Bluetooth está habilitado
   - Selecione um dispositivo GAIA pareado da lista
   - Aguarde a conexão ser estabelecida

2. **Configurar Equalizador**:

   - Selecione uma banda (1-5) para configurar
   - Escolha o tipo de filtro desejado
   - Ajuste os parâmetros disponíveis (frequência, ganho, qualidade)
   - Configure o master gain global

3. **Salvar Configurações**:
   - As configurações são aplicadas automaticamente ao dispositivo
   - Use o botão "Refresh values" para recarregar as configurações atuais

## Regras de Negócio

- **Estado Incorreto**: O dispositivo deve estar reproduzindo áudio para usar comandos de equalização
- **Recálculo em Tempo Real**: Apenas aplicado quando o preset customizado (bank 1) está selecionado
- **Validação de Parâmetros**: Todos os parâmetros são validados conforme os limites do filtro selecionado
- **Sincronização**: O estado da interface é sempre sincronizado com o dispositivo

## Compatibilidade

- **Android**: API 23+ (Android 6.0+)
- **iOS**: iOS 11.0+
- **Dispositivos GAIA**: Qualcomm GAIA v3.4+

## Baseado em

Este projeto é uma implementação React Native fiel do SDK Android GAIA Control 3.4.0.52, mantendo:

- Mesma estrutura de comandos GAIA
- Mesmos parâmetros e limites
- Mesma lógica de negócio
- Interface similar ao aplicativo original

## Licença

Baseado no SDK Qualcomm GAIA Control Android 3.4.0.52
