# Prometheus — Ağ ve Sistem sunumu

Hazırlayanlar: Cemil Can Öz, Mesut Özdemir. Seslendirme rehberi: [Anlatim-Metni.md](Anlatim-Metni.md).

Akış: siyah açılış (adlar → yanıp sönen ateş), 14 sahne (kapak, neden izleme, tanım, veri modeli, çekme modeli, mimari, metrik tipleri, kur-çalıştır, prometheus.yml, PromQL, Node Exporter hedefleri, recording rule, değerlendirme, kapanış), siyah bitiş (ateş söner).

İçerik kaynağı: [prometheus.io başlangıç kılavuzu](https://prometheus.io/docs/prometheus/latest/getting_started/), [genel bakış](https://prometheus.io/docs/introduction/overview/), [metrik tipleri](https://prometheus.io/docs/concepts/metric_types/) ve [GitHub deposu](https://github.com/prometheus/prometheus). Terminal günlük satırları ve sorgu sonuç değerleri temsilidir; komutlar, YAML ve sorgular kılavuzdandır.

## Açma

`index.html` dosyasını tarayıcıda aç (yanındaki `styles.css`, `app.js` ve `assets/` ile birlikte dursun). Yazı tipleri Google Fonts'tan gelir; internet yoksa Georgia/Consolas ile açılır.

## Kontroller

- Sağ ok / boşluk: sonraki adım veya sahne. Sol ok: geri.
- F: tam ekran. H: alttaki kontrol şeridini gizle (kayıt için).
- N: Cemil/Mesut'a bölünmüş kısa konuşma metni.
- R: sahneyi baştan oynat. M: bütün hareketi durdur/başlat.
- Home: siyah açılışa dön. Kapaktaki adlar tıklanıp düzenlenir.

## Maskot

Referans görsel `assets/maskot-referans.webp`. Sunumdaki maskot bu görsele bakılarak SVG olarak yeniden çizildi; alev titrer, kıvılcım çıkar, sahneler arasında yürür, el sallar, işaret eder, kapanışta ellerini açıp takla atar.

## İsteğe bağlı Gemini görselleri

Üç boş yuva var; dosya yoksa sahne onsuz düzgün görünür. Görseli üretip aşağıdaki adla `assets/` içine koymak yeterli, kod değişmez. Görseller bir adıma bağlı değildir: sahne açılır açılmaz (adım 0) görünür ve sahne boyunca kalır. Beyaz zemin kâğıt dokusuna karışır, şeffaflık gerekmez.

| Dosya | Sahne | Yeri | Genişlik |
| --- | --- | --- | --- |
| `assets/gravur-sunucu.png` | 2 · Sistem yavaşladı | sağ üst köşe, başlığın sağı, grafiğin üstü | 230 px |
| `assets/gravur-ates.png` | 3 · Prometheus nedir? | sağ üst köşe, başlığın sağı, zaman çizgisinin üstü | 300 px |
| `assets/gravur-fener.png` | 13 · Nerede parlar | sağ üst köşe, "Uygun değil" sütununun üstü | 210 px |

Kare (1:1) üret. Ortak stil cümlesi (her isteme ekle): *Tek renk gravür / linol baskı stili, koyu kahve-siyah mürekkep çizgileri (#1A1512), yalnız alevde turuncu (#E6522C) vurgu, saf beyaz zemin, yazı yok, çerçeve yok, kare kadraj, ince taramalı gölgeler, eski bilim ansiklopedisi illüstrasyonu hissi.*

1. `gravur-sunucu.png`: Karanlık bir sunucu dolabı, önünde elinde küçük bir meşale tutan kapüşonlu küçük bir figür; meşalenin ışığı dolaptaki tek bir arızalı birimi aydınlatıyor.
2. `gravur-ates.png`: Mitolojideki Prometheus; elinde yanan bir rezene sapı meşalesiyle dağdan aşağı yürüyen titan, arkasında ışınsal çizgilerle güneş.
3. `gravur-fener.png`: Dalgalı denizde tek başına duran bir deniz feneri, tepesinde turuncu alev, etrafında ince ışın çizgileri.
