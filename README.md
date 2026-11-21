# Occasion Desk
Requires Node.js 24. From this folder run:
 
    node studio.mjs
     
Open http://127.0.0.1:4173/studio and choose **Explore the sample workspace**. Each launch creates a separate demo with fictional data. Try adding an inquiry, scheduling a visit, saving meeting notes and confirming the booking. The portfolio is at the server root.

## Set up a firm locally
Run once per administrator, using the same firm slug for both partners and a distinct email for each:

    node studio.mjs admin heavenly-events "Heavenly Events" first@example.com
    node studio.mjs admin heavenly-events "Heavenly Events" second@example.com

Save each generated password privately. Repeat with a new slug for another firm. Admin accounts are provisioned by the operator. Link the firm's existing Contact button to /inquire/FIRM-SLUG on the running service. This hosted form collects leads without giving visitors access to records. The Heavenly Events portfolio retains its Instagram inquiry flow.

Data persists in .studio-data/studio.sqlite. Set STUDIO_DATA to use a different directory. Do not publish or share that directory. The server listens on loopback. For client hosting, provide HTTPS through a reverse proxy, enable COOKIE_SECURE=1, and establish backups, login and submission rate limits, and password recovery before collecting live client records.
