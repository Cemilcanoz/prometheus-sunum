# Bilinmesi gerekenler

Sunumu yapmadan veya izlemeden önce okunacak özet. Kaynak: [prometheus.io belgeleri](https://prometheus.io/docs/introduction/overview/).

## Bir paragrafta Prometheus

Prometheus, açık kaynak bir izleme ve uyarı araç setidir. İzlenen sistemlerden sayısal ölçümleri (metrikleri) belirli aralıklarla kendisi çeker, bunları etiketli zaman serileri olarak kendi diskinde saklar, PromQL adlı diliyle sorgulatır ve tanımlanan bir koşul gerçekleştiğinde uyarı üretir. 2012'de SoundCloud'da başladı; 2016'da Kubernetes'ten sonra ikinci proje olarak Cloud Native Computing Foundation'a (CNCF) katıldı. Go ile yazılmıştır ve Apache 2.0 lisanslıdır.

## Kavram sözlüğü

| Kavram | Anlamı |
| --- | --- |
| İzleme (monitoring) | Sistemin durumunu sürekli ölçüp kaydetmek; sorun çıkınca sebebini veriyle bulmak. |
| Metrik | Sayısal ölçüm: istek sayısı, bellek kullanımı, işlemci süresi. |
| Zaman serisi | Aynı ölçümün zaman damgasıyla art arda kaydedilmiş değerleri. |
| Etiket (label) | Seriye eklenen anahtar=değer çifti; aynı metriği makineye, işe, moda göre ayırır. |
| Örnek (sample) | Bir zaman damgası ve bir sayıdan oluşan tek ölçüm. |
| Scrape | Prometheus'un bir hedefin `/metrics` adresini okuması. |
| Hedef (target) | Metrik sunan adres, örn. `localhost:8080`. |
| Job | Aynı işi yapan hedeflerin grubu; adı her seriye `job` etiketi olarak eklenir. |
| Exporter | Kendisi metrik sunmayan bir sistemin verisini Prometheus biçimine çeviren program. Node Exporter makine metriklerini verir. |
| PromQL | Prometheus'un sorgu dili. |
| TSDB | Zaman serisi veritabanı; Prometheus veriyi yerel diskte tutar. |
| Alertmanager | Uyarıları gruplayıp e-posta, sohbet gibi kanallara ileten ayrı bileşen. |
| Pushgateway | Çekilmeyi bekleyemeyecek kadar kısa süren işlerin metrik bıraktığı ara durak. |
| Servis keşfi | Hedeflerin elle yazılmadan otomatik bulunması. |
| Recording rule | Sık kullanılan pahalı bir sorguyu düzenli çalıştırıp sonucunu yeni seri olarak kaydeden kural. |

## Veri modeli

Her seri bir metrik adı ve etiketlerle tanımlanır:

```
node_cpu_seconds_total{job="node", instance="localhost:8080", mode="idle"}
```

- `node_cpu_seconds_total`: metrik adı, neyin ölçüldüğü.
- `{...}`: etiketler; hangi iş, hangi makine, hangi mod.
- Her seri, zaman damgası + değer çiftlerinden oluşan örnekler taşır.

## Nasıl çalışır?

1. Uygulamalar ve exporter'lar metriklerini bir `/metrics` adresinde sunar.
2. Prometheus bu adresleri HTTP ile düzenli aralıklarla okur (çekme / pull modeli). Kısa ömürlü işler Pushgateway'e iter.
3. Okunan örnekler yerel diske yazılır (varsayılan `./data`).
4. Kurallar bu veri üzerinde çalışır: yeni özet seriler kaydeder veya uyarı üretir.
5. Uyarılar Alertmanager'a gider; o da bildirimi iletir.
6. Web arayüzü, Grafana veya başka API istemcileri veriyi PromQL ile sorgular.

## Dört metrik tipi

| Tip | Davranış | Örnek |
| --- | --- | --- |
| Counter | Yalnızca artar; yeniden başlatmada sıfırlanır. | Sunulan istek sayısı, hata sayısı |
| Gauge | Serbestçe artıp azalır. | Sıcaklık, bellek kullanımı |
| Histogram | Gözlemleri kovalara sayar; toplamı da tutar. | İstek süresi, yanıt boyutu |
| Summary | Sayı ve toplamın yanında yüzdelikleri istemcide hesaplar. | İstek süresi yüzdelikleri |

## Komut kopya kâğıdı

Başlangıç kılavuzundaki adımlar:

```bash
# Kur ve çalıştır
tar xvfz prometheus-*.tar.gz
cd prometheus-*
./prometheus --config.file=prometheus.yml

# Docker ile
docker run --name prometheus -d -p 127.0.0.1:9090:9090 prom/prometheus

# Örnek hedefler (üç ayrı terminal)
./node_exporter --web.listen-address 127.0.0.1:8080
./node_exporter --web.listen-address 127.0.0.1:8081
./node_exporter --web.listen-address 127.0.0.1:8082

# Yapılandırmayı kapatmadan yeniden yükle
kill -s SIGHUP <PID>
```

Adresler:

- `http://localhost:9090` — arayüz
- `http://localhost:9090/metrics` — Prometheus'un kendi metrikleri
- `http://localhost:9090/targets` — hedeflerin durumu (UP / DOWN)

## Yapılandırma: prometheus.yml

```yaml
global:
  scrape_interval: 15s          # varsayılan okuma aralığı
  evaluation_interval: 15s      # kuralların çalışma aralığı
  external_labels:
    monitor: 'codelab-monitor'  # dış sistemlerle konuşurken eklenen etiket

rule_files:
  - 'prometheus.rules.yml'

scrape_configs:
  - job_name: 'prometheus'      # Prometheus kendini izler
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:8080', 'localhost:8081']
        labels:
          group: 'production'
      - targets: ['localhost:8082']
        labels:
          group: 'canary'
```

Recording rule dosyası (`prometheus.rules.yml`):

```yaml
groups:
- name: cpu-node
  rules:
  - record: job_instance_mode:node_cpu_seconds:avg_rate5m
    expr: avg by (job, instance, mode) (rate(node_cpu_seconds_total[5m]))
```

## PromQL örnekleri

| Sorgu | Ne yapar |
| --- | --- |
| `prometheus_target_interval_length_seconds` | Metriğin bütün serilerini getirir. |
| `prometheus_target_interval_length_seconds{quantile="0.99"}` | Etikete göre süzer. |
| `count(prometheus_target_interval_length_seconds)` | Seri sayısını verir. |
| `rate(prometheus_tsdb_head_chunks_created_total[1m])` | Sayacın son 1 dakikadaki saniyelik artış hızı. |
| `node_cpu_seconds_total` | Makinelerin işlemci süreleri (Node Exporter). |
| `avg by (job, instance, mode) (rate(node_cpu_seconds_total[5m]))` | Makine ve mod başına ortalama işlemci hızı. |

## Ne zaman uygun, ne zaman değil?

**Uygun:** tamamen sayısal zaman serileri; makine merkezli izleme; çok dinamik, servis odaklı mimariler ve mikroservisler. Her sunucu tek başına çalıştığı için kesinti anında da kullanılabilir.

**Uygun değil:** %100 doğruluk isteyen işler, örneğin istek başına faturalama. Toplanan veri bu iş için yeterince ayrıntılı ve eksiksiz olmayabilir.

## Gelebilecek sorular

- **Neden çekme, neden itme değil?** Prometheus kimi izleyeceğini kendisi bilir; bir hedef cevap vermezse bunu hemen fark eder (hedef DOWN görünür). Hedeflerin Prometheus'un adresini bilmesi gerekmez.
- **Grafana ile farkı ne?** Prometheus veriyi toplar ve saklar; Grafana o veriyi panolarda gösterir. Birlikte kullanılırlar.
- **Counter ile gauge farkı?** Counter yalnız artar (toplam istek). Gauge inip çıkar (anlık bellek).
- **`rate()` ne yapar?** Bir sayacın verilen pencerede saniyede ortalama ne kadar arttığını hesaplar. Sayaçlar hep büyüdüğü için ham değer yerine hızına bakılır.
- **Veri nerede duruyor?** Varsayılan olarak Prometheus'un çalıştığı klasördeki `./data` içinde.
- **Varsayılan port?** 9090.
- **Kim geliştirdi?** 2012'de SoundCloud'da başladı; bugün tek bir şirkete bağlı olmayan bağımsız bir projedir.
