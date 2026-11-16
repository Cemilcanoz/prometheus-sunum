# Prometheus sunumu — anlatım metni

Cemil ve Mesut için sahne sahne, adım adım seslendirme rehberi. **[bas]** = sağ ok veya boşluk. Metinler örnektir; kendi cümlenizle söylemeniz daha doğal olur. Aynı metnin kısa hâli sunumda `N` tuşuyla da açılır.

Toplam süre rahat tempoda yaklaşık 9–11 dakika. Önerilen paylaşım: Cemil kavramları (1–7), Mesut uygulamayı (8–12), kapanışı birlikte.

## Sunumdan önce bilmeniz gerekenler

Bunlar slaytta yazmıyor ama soru gelirse lazım olur.

| Kavram | Bir cümleyle |
| --- | --- |
| İzleme (monitoring) | Sistemin durumunu sürekli ölçüp kaydetmek; sorun çıkınca sebebini veriyle bulmak. |
| Metrik | Sayısal ölçüm: istek sayısı, bellek kullanımı, işlemci süresi. |
| Zaman serisi | Aynı ölçümün zaman damgasıyla art arda kaydedilmiş değerleri. |
| Etiket (label) | Seriye eklenen anahtar=değer çifti; aynı metriği makineye, işe, moda göre ayırır. |
| Scrape | Prometheus'un bir hedefin `/metrics` adresini okuması. |
| Hedef (target) | Metrik sunan adres, örn. `localhost:8080`. |
| Job | Aynı işi yapan hedeflerin grubu. |
| Exporter | Kendisi metrik sunmayan bir sistemin (işletim sistemi, veritabanı) verisini Prometheus biçimine çeviren küçük program. Node Exporter makine metriklerini verir. |
| PromQL | Prometheus'un sorgu dili. |
| TSDB | Zaman serisi veritabanı; Prometheus veriyi kendi yerel diskinde tutar. |
| Alertmanager | Prometheus'un ürettiği uyarıları gruplayıp e-posta, sohbet gibi kanallara ileten ayrı bileşen. |
| Pushgateway | Çekilmeyi bekleyemeyecek kadar kısa süren işlerin metrik bıraktığı ara durak. |
| Recording rule | Sık kullanılan pahalı bir sorguyu düzenli çalıştırıp sonucunu yeni seri olarak kaydeden kural. |
| 9090 | Prometheus'un varsayılan portu. |

**Gelebilecek sorular ve kısa cevaplar**

- *Neden çekme (pull), neden itme (push) değil?* Prometheus kimi izleyeceğini kendisi bilir; bir hedef cevap vermezse bunu hemen fark eder (hedef DOWN görünür). Hedeflerin Prometheus'un adresini bilmesi gerekmez.
- *Grafana ile farkı ne?* Prometheus veriyi toplar ve saklar; Grafana o veriyi panolarda gösterir. Rakip değil, birlikte kullanılırlar.
- *Counter ile gauge farkı?* Counter yalnız artar (toplam istek). Gauge inip çıkar (anlık bellek).
- *`rate()` ne yapar?* Bir sayacın verilen pencere içinde saniyede ortalama ne kadar arttığını hesaplar. Sayaçlar hep büyüdüğü için ham değer yerine hızına bakılır.
- *Veri nerede duruyor?* Varsayılan olarak Prometheus'un çalıştığı klasördeki `./data` içinde.
- *Her işte kullanılır mı?* Hayır; istek başına faturalama gibi %100 doğruluk isteyen işlerde önerilmez.
- *Kim geliştirdi?* 2012'de SoundCloud'da başladı; 2016'da CNCF'e Kubernetes'ten sonra ikinci proje olarak katıldı.

Slaytlardaki terminal günlük satırları ve sorgu sonuç değerleri temsilidir. Komutlar, YAML dosyaları ve sorgular resmî başlangıç kılavuzundaki gibidir. Sorulursa böyle söyleyin.

## Sahne sahne anlatım

### Açılış (siyah ekran) — konuşma yok
- Başlangıç: ekran simsiyah. Kayda burada başlayın.
- **[bas] adım 1:** Adlarınız ve "Prometheus Sunumu" beyaz yazıyla sırayla gelir. Yaklaşık 3 saniye bekleyin.
- **[bas] adım 2:** Yazılar söner, Prometheus logosu ateş gibi parlar ve söner (yaklaşık 6 saniye). Ekran yeniden kararınca **[bas]**.

### 1 · Kapak — Cemil
Maskot içeri yürür ve el sallar.
> "Merhaba, biz Cemil ve Mesut. Bugün Prometheus'u anlatacağız: sistemleri izlemek ve bir sorun çıktığında haber almak için kullanılan açık kaynak bir araç. Önce ne olduğunu ve nasıl çalıştığını, sonra da kendi sitesindeki başlangıç kılavuzunu adım adım göstereceğiz."

### 2 · Sistem yavaşladı. Peki neden? — Cemil
- **Adım 0:** "Bir sistem yavaşladığında ilk soru şudur: neden? Tahmin etmek yerine ölçmemiz gerekir."
- **[bas] 1** (tanım + grafik çizilir): "Metrik sayısal bir ölçümdür. Bu ölçümü zaman içinde kaydedersek buna zaman serisi denir."
- **[bas] 2** (örnekler): "Bir web sunucusunda istek sürelerini, bir veritabanında aktif bağlantı sayısını ölçebiliriz."
- **[bas] 3** (grafikteki tepe işaretlenir): "Şuradaki gibi istek sayısı tavan yapmışken uygulama yavaşsa sebep yüktür; sunucu eklemek çözüm olabilir. Ölçmeseydik bunu bilemezdik."

### 3 · Prometheus nedir? — Cemil
- **Adım 0:** "Prometheus bir izleme ve uyarı araç setidir. Metrikleri toplar, saklar, kurallarla değerlendirir ve koşul gerçekleşince uyarı üretir."
- **[bas] 1:** "2012'de SoundCloud'da geliştirilmeye başlandı."
- **[bas] 2:** "2016'da Kubernetes'ten sonra ikinci proje olarak CNCF'e, yani Cloud Native Computing Foundation'a katıldı."
- **[bas] 3:** "Bugün tek bir şirkete bağlı olmayan bağımsız bir proje. Go diliyle yazılmış ve Apache 2.0 lisanslı."

### 4 · Her şey bir zaman serisi — Cemil
- **Adım 0:** "Prometheus'ta her veri bir zaman serisidir."
- **[bas] 1:** "Serinin ilk parçası metrik adıdır; neyin ölçüldüğünü söyler. Burada işlemcinin harcadığı toplam saniye."
- **[bas] 2:** "İkinci parça etiketlerdir. Aynı metriği hangi iş, hangi makine, hangi mod diye boyutlara ayırır. Buna çok boyutlu veri modeli denir."
- **[bas] 3** (örnekler akmaya başlar): "Her seri art arda örneklerden oluşur; her örnek bir zaman damgası ve bir sayıdır."

### 5 · Sormaz, gidip alır — Cemil
- **Adım 0:** "Peki bu veri Prometheus'a nasıl ulaşır?"
- **[bas] 1:** "Prometheus beklemez, kendisi gidip alır. Hedeflerin /metrics adresini HTTP ile belirli aralıklarla okur. Buna çekme, yani pull modeli denir."
- **[bas] 2:** "Çok kısa süren işler çekilmeyi bekleyemez; onlar metriklerini Pushgateway denen ara bir bileşene bırakır."
- **[bas] 3:** "Hedefler ya servis keşfiyle otomatik bulunur ya da yapılandırma dosyasına elle yazılır."

### 6 · Mimari — Cemil
- **Adım 0:** "Şimdi parçaları bir arada görelim."
- **[bas] 1:** "Solda metrik kaynakları var: kendi uygulamalarımız ve exporter'lar."
- **[bas] 2:** "Kısa ömürlü işler için Pushgateway, hedefleri bulmak için servis keşfi."
- **[bas] 3:** "Ortada Prometheus sunucusu: metrikleri toplar, yerel diskteki zaman serisi veritabanına yazar ve kuralları çalıştırır."
- **[bas] 4:** "Bir uyarı koşulu gerçekleşirse Alertmanager'a iletir; o da e-posta ya da sohbet kanalıyla haber verir."
- **[bas] 5:** "Veriyi görmek isteyen web arayüzü ya da Grafana, sunucuya PromQL ile soru sorar."

### 7 · Dört metrik tipi — Cemil
- **[bas] 1:** "Counter yalnızca artar: toplam istek sayısı gibi."
- **[bas] 2:** "Gauge artıp azalabilir: bellek kullanımı ya da sıcaklık gibi."
- **[bas] 3:** "Histogram gözlemleri kovalara ayırıp sayar: istek sürelerinin dağılımı gibi."
- **[bas] 4:** "Summary da benzer, ama yüzdelikleri istemci tarafında hesaplar. Şimdi uygulamaya geçelim, söz Mesut'ta."

### 8 · Uygulama 1: Kur ve çalıştır — Mesut
Terminal kendi kendine yazar; yazı bitmeden konuşmaya başlayabilirsiniz.
- **Adım 0:** "Prometheus tek bir çalıştırılabilir dosya olarak gelir. İndirdiğimiz arşivi açıp klasöre giriyoruz."
- **[bas] 1:** "Yapılandırma dosyasını göstererek başlatıyoruz. Sunucu isteklere hazır olduğunu söylüyor."
- **[bas] 2:** "Tarayıcıda localhost 9090'ı açınca arayüz gelir. /metrics adresinde Prometheus'un kendi metriklerini görürüz."
- **[bas] 3:** "İstersek aynı şeyi Docker ile tek komutla da yapabiliriz."

### 9 · prometheus.yml — Mesut
- **Adım 0:** "Az önce verdiğimiz yapılandırma dosyasına bakalım."
- **[bas] 1:** "global bölümü varsayılanları belirler: hedefler 15 saniyede bir okunur."
- **[bas] 2:** "external_labels, Prometheus dış sistemlerle konuşurken eklenen etikettir."
- **[bas] 3:** "scrape_configs altında bir iş tanımlıyoruz. Adı prometheus; bu ad her seriye job etiketi olarak eklenir. Bu iş için aralığı 5 saniyeye indirmişiz."
- **[bas] 4:** "Hedef localhost 9090. Yani Prometheus burada kendi kendini izliyor."

### 10 · Uygulama 2: PromQL — Mesut
Sorgu kutusuna yazı kendiliğinden yazılır.
- **Adım 0:** "Sorgu arayüzüne bir metrik adı yazıyoruz. Bu metrik, okumalar arasındaki gerçek süreyi gösterir. Beş seri geldi; her biri farklı bir yüzdelik."
- **[bas] 1:** "Süslü parantezle etikete göre süzüyoruz: yalnız 0.99 yüzdeliği kaldı."
- **[bas] 2:** "count fonksiyonu kaç seri olduğunu sayar."
- **[bas] 3:** "Graph sekmesinde rate fonksiyonunu kullanıyoruz. rate, bir sayacın son bir dakikada saniyede ne kadar arttığını çizer."

### 11 · Uygulama 3: Node Exporter — Mesut
- **Adım 0:** "Gerçek bir hedef ekleyelim. Node Exporter makine metriklerini sunar; üç ayrı makineyi taklit etmek için onu üç farklı portta başlatıyoruz."
- **[bas] 1:** "Yapılandırmaya node adında yeni bir iş ekliyoruz. İlk ikisini production, üçüncüsünü canary grubuna koyuyoruz."
- **[bas] 2:** "Prometheus'u yeniden başlatınca Targets sayfasında üçü de UP görünür. Biri DOWN olsaydı o portta exporter çalışmıyor demekti."
- **[bas] 3:** "Artık node_cpu_seconds_total gibi makine metriklerini sorgulayabiliriz. Verdiğimiz group etiketi her seride duruyor."

### 12 · Uygulama 4: Recording rule — Mesut
- **Adım 0:** "Binlerce seriyi her sorguda toplamak yavaşlayabilir."
- **[bas] 1:** "Bunun için recording rule yazıyoruz. Bu ifade her makine ve mod için son beş dakikadaki ortalama işlemci hızını hesaplar ve yeni bir adla kaydeder."
- **[bas] 2:** "Kural dosyasını prometheus.yml'e ekliyoruz. Yeniden başlatınca yeni seri sorgulanabilir olur."
- **[bas] 3:** "Yapılandırmayı süreci kapatmadan SIGHUP sinyaliyle yeniden yükleyebiliriz. Kapatmak için Ctrl+C yeterli."

### 13 · Nerede parlar, nerede yanmaz? — Cemil
- **[bas] 1:** "Prometheus sayısal zaman serilerinde, mikroservislerde ve sürekli değişen ortamlarda güçlüdür. Her sunucu tek başına çalıştığı için başka sistemler çökse bile kullanılabilir."
- **[bas] 2:** "Ama yüzde yüz doğruluk gereken işlerde uygun değildir; örneğin istek başına faturalama. Böyle işler için ayrı bir sistem önerilir."

### 14 · Kapanış — Mesut, son cümle birlikte
Maskot ellerini açar ve takla atar. Maddeler birer birer gelir.
- **[bas] 1:** "Özetle: Prometheus hedeflerden metrikleri çeker."
- **[bas] 2:** "Etiketli zaman serisi olarak kendi diskinde saklar."
- **[bas] 3:** "PromQL ile sorgulanır, kurallarla özetlenir."
- **[bas] 4:** "Koşul gerçekleşince Alertmanager haber verir. Dinlediğiniz için teşekkürler."

### Bitiş (siyah ekran) — konuşma yok
- **[bas]:** Ateş birkaç saniye yanar, alev küçülür ve söner; ekran siyah kalır. Kaydı burada kesin.
