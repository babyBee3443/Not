# BioLinguaLearn - Akademik Biyoloji İngilizce Asistanı

BioLinguaLearn, Türkçe biyoloji terimlerini ve cümlelerini akademik düzeyde İngilizce'ye çevirmenize, tanımlarını ve açıklamalarını almanıza yardımcı olan yapay zeka destekli bir web uygulamasıdır. Lise ve üniversite öğrencileri ile akademisyenler için tasarlanmıştır.

## Temel Özellikler

*   **Türkçe-İngilizce Terim Çevirisi:** Biyolojik terimleri anında İngilizce'ye çevirin.
*   **Akademik Tanım ve Açıklama:** Çevrilen terimler için "Basit" veya "Detaylı" seviyede akademik açıklamalar alın.
*   **Cümle Çevirisi:** Tam Türkçe cümleleri akademik İngilizce'ye çevirin.
*   **Etkileşimli Kelime Çevirisi:** İngilizce metinlerdeki kelimelerin üzerine gelerek (veya mobilde dokunarak) anlık Türkçe çevirilerini görün.
*   **İsteğe Bağlı Türkçe Çeviri:** İngilizce sonuçların Türkçe çevirilerini bir butonla gösterip gizleyin.
*   **Geçmiş ve Favoriler:** Çeviri geçmişinizi görüntüleyin ve sık kullandığınız terimleri favorilerinize ekleyin. Arama özelliği ile geçmiş ve favorilerde kolayca filtreleme yapın.
*   **Not Oluşturucu:** Belirttiğiniz konu, sınıf seviyesi, anlatım tonu ve detay seviyesine göre yapay zeka destekli biyoloji ders notları oluşturun. Notlar, anahtar kavramlar, ilginç bilgiler, Web 2.0 araç önerileri ve kavram ilişkilerini içerebilir.
*   **Test Oluşturucu:** Belirttiğiniz konu (veya genel), sınıf seviyesi, zorluk ve soru sayısına göre çoktan seçmeli biyoloji testleri hazırlayın ve çözün.
*   **Alıştırmalar (Boşluk Doldurma):** Konu, sınıf ve zorluk seviyesine göre boşluk doldurma alıştırmaları çözün.
*   **Soru Tarama:** Bir biyoloji sorusunun fotoğrafını çekerek veya galeriden yükleyerek yapay zekadan çözüm ve açıklama alın. Yanlış cevaplar için geri bildirimde bulunun.
*   **PDF Olarak Yazdırma:** Çeviri sonuçlarınızı (İngilizce ve Türkçe çevirileriyle birlikte) PDF olarak kaydedin.
*   **Kullanıcı Dostu Arayüz:** Açık ve koyu tema desteği, modern ve duyarlı tasarım. Tüm sayfalarda "Yukarı Çık" butonu.

## Kullanılan Teknolojiler

*   Next.js (React Framework)
*   TypeScript
*   Tailwind CSS
*   ShadCN UI (Bileşen Kütüphanesi)
*   Genkit (Google AI entegrasyonu için)
*   Lucide React (İkonlar)

## Kurulum ve Çalıştırma (Geliştirme Ortamı)

1.  Proje dosyalarını klonlayın:
    ```bash
    git clone <repository-url>
    ```
2.  Proje dizinine gidin:
    ```bash
    cd BioLinguaLearn 
    ```
    (veya proje klasörünüzün adı neyse)
3.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
4.  Projenin kök dizininde `.env` adında bir dosya oluşturun. Bu dosyaya Google API anahtarınızı aşağıdaki formatta ekleyin:
    ```env
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
    ```
    `YOUR_GOOGLE_API_KEY_HERE` kısmını kendi geçerli Google API anahtarınızla değiştirin.
5.  Next.js geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```
6.  Genkit geliştirme sunucusunu ayrı bir terminalde başlatın:
    ```bash
    npm run genkit:dev
    ```

Uygulama varsayılan olarak `http://localhost:9002` (veya `npm run dev` komutunun belirttiği portta) çalışacaktır.

## Dağıtım (Deployment)

Next.js uygulamalarını dağıtmak için [Vercel](https://vercel.com) veya [Netlify](https://www.netlify.com/) gibi platformlar önerilir. Bu platformlar, GitHub repository'niz ile kolayca entegre olabilir ve otomatik dağıtım süreçleri sunar.

## Katkıda Bulunma

Katkılarınız için teşekkürler! Lütfen bir "issue" açın veya "pull request" gönderin.
