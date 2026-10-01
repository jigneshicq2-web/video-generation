import json, subprocess, os, base64, tempfile
KEY=os.path.expanduser('~/.elevenlabs_key')
def call(vid, text, out_mp3):
    """ElevenLabs v3 with timestamps via curl. Returns (alignment dict, cost header) or raises."""
    body=json.dumps({'text':text,'model_id':'eleven_v3'})
    hdr=tempfile.mktemp()
    r=subprocess.run(['curl','-sS','-D',hdr,'-X','POST',f'https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128',
        '-H','xi-api-key: '+open(KEY).read().strip(),'-H','Content-Type: application/json','--data-binary',body],capture_output=True,check=True)
    h=open(hdr).read(); os.remove(hdr)
    d=json.loads(r.stdout)
    if 'audio_base64' not in d: raise RuntimeError(str(d)[:300])
    open(out_mp3,'wb').write(base64.b64decode(d['audio_base64']))
    cost=[l.split(':',1)[1].strip() for l in h.splitlines() if l.lower().startswith('character-cost')]
    return d['alignment'], (cost[0] if cost else '?')
