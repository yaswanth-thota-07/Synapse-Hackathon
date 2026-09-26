import urllib.request
import json

def test():
    # 1. Health check
    res = urllib.request.urlopen('http://localhost:5000/api/health')
    print('Health Check Status:', res.status, json.loads(res.read()))

    # 2. Discover Peers for TCS
    res2 = urllib.request.urlopen('http://localhost:5000/api/peers/discover?ticker=TCS.NS')
    data = json.loads(res2.read())
    tc = data['target_company']
    print(f"\nTarget Company: {tc['company_name']} ({tc['ticker']})")
    print(f"Sector: {tc['sector']} | Industry: {tc['industry']}")
    print(f"Target Strength Score: {tc['company_score']['score_display']}")
    print(f"Universe: {data['universe_info']['industry']} ({data['universe_info']['peer_count']} peers)")

    print("\nTop 5 Discovered Peers:")
    for p in data['peers'][:5]:
        cs = p['company_score']['score_display']
        print(f"  #{p['rank']} {p['company_name']} ({p['ticker']}) | Similarity: {p['similarity_score']}% | Score: {cs}")

    # 3. Test Search endpoint
    res3 = urllib.request.urlopen('http://localhost:5000/api/companies/search?q=HDFC')
    search_data = json.loads(res3.read())
    print(f"\nSearch results for 'HDFC': {len(search_data['results'])} matches")
    for r in search_data['results'][:3]:
        print(f"  - {r['company_name']} ({r['ticker']}) - {r['industry']}")

    # 4. Test Frontend served on root
    res4 = urllib.request.urlopen('http://localhost:5000/')
    html = res4.read().decode('utf-8')
    print(f"\nFrontend root status: {res4.status} (HTML length: {len(html)} chars)")

test()
