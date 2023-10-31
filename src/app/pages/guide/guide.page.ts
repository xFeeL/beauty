import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.page.html',
  styleUrls: ['./guide.page.scss'],
})
export class GuidePage implements OnInit {
  segment = 'desktop'; 

  desktopStepsGreeting = [
    {
      title: '1. Προαπαιτούμενα',
      description: 'Ο παρακάτω τρόπος ισχύει τόσο για Facebook όσο και για Instagram. Για το Instagram, πρέπει επιπλέον να συνδέσετε τις σελίδες σας σε Instagram και Facebook, ακολουθώντας τις οδηγίες <a href="https://youtu.be/gRixch2XuHQ?t=65" target="_system">εδώ</a>. Για τον ορισμό του αυτόματου χαιρετισμού, πρέπει να έχετε δικαιώματα διαχειριστή στη σελίδα σας.'    },
    {
      title: '2. Σύνδεση στο Facebook',
      description: 'Επισκεφτείτε το <a href="https://www.facebook.com/" target="_system">Facebook</a> και συνδεθείτε στον λογαριασμό σας.',
    },
    {
      title: '3. Επιλογή Σελίδας',
      description: 'Επιλέξτε τη σελίδα σας από το αριστερό μενού της αρχικής σελίδας, διαλέγοντας την επιλογή "Σελίδες" και στη συνέχεια την σελίδα σας ή κατευθείαν από τις συντομεύσεις σας στο κάτω μέρος του μενού.',
    },
    {
      title: '4. Πλοήγηση στο Business Suite',
      description: 'Αμέσως μετά πατήστε στην επιλογή "Meta Business Suite" από το αριστερό μενού.',
    },
    {
      title: '5. Ρυθμίσεις Συνομιλίας',
      description: 'Μόλις μπείτε στο Business Suite επιλέξτε την επιλογή "Εισερχόμενα" από το μενού στα αριστερά.',
    },
    {
      title: '6. Αυτοματοποίηση',
      description: 'Όταν ανοίξουν τα εισερχόμενα επιλέξτε το κουμπί "Αυτοματοποίηση" που βρίσκεται πάνω δεξιά στην οθόνη σας.',
    },
    {
      title: '7. Δημιουργία αυτοματοποίησης',
      description: 'Όταν ανοίξουν τα εισερχόμενα επιλέξτε το κουμπί "Αυτοματοποίηση που βρίσκεται πάνω δεξιά στην οθόνη σας, στη συνέχεια το κουμπί που βρίσκεται πάνω δεξία "Δημιουργία αυτοματοποίησης" και τέλος το κουμπί "Άμεση απάντηση".',
    },
    {
      title: '8. Αποθήκευση',
      description: 'Ενεργοποιήστε την άμεση απάντηση που βρίσκεται στο πάνω μέρος της οθόνης και επιλέξτε από κάτω τα κανάλια που θέλετε να ενεργοποιήσετε την άμεση απάντηση. Για να φανεί το κανάλι του Instagram εδώ πρέπει να έχετε συνδέσει την σελίδα του Instagram με αυτή του Facebook. Προσθέστε το κείμενο που δημιουργήσαμε για εσάς στην προηγούμενη οθόνη. Τέλος πατήστε το κουμπί "Αποθήκευση αλλαγών".',
    },
  ];

  mobileStepsGreeting = [
    {
      title: '1. Προαπαιτούμενα',
      description: 'Ο παρακάτω τρόπος ισχύει τόσο για Facebook όσο και για Instagram. Κατεβάστε από το Play Store / App Store την εφαρμογή Meta Business Suite. Για το Instagram, πρέπει επιπλέον να συνδέσετε τις σελίδες σας σε Instagram και Facebook, ακολουθώντας τις οδηγίες <a href="https://youtu.be/gRixch2XuHQ?t=65" target="_system">εδώ</a>. Για τον ορισμό του αυτόματου χαιρετισμού, πρέπει να έχετε δικαιώματα διαχειριστή στη σελίδα σας.'    },
    {
      title: '2. Σύνδεση στο Facebook',
      description: 'Συνδεθείτε στον λογαριασμό σας στο Facebook.',
    },
    {
      title: '3. Πλοήγηση Menu',
      description: 'Πατήστε το κουμπί που βρίσκεται στην κάτω δεξιά γωνία για να ανοίξει η οθόνη "Περισσότερα εργαλεία" και έπειτα την επιλογή "Ρυθμίσεις".',
    },
    {
      title: '4. Πλοήγηση στις Αυτοματοποιήσεις',
      description: 'Στη συνέχεια επιλέξτε την επιλογή "Αυτοματοποιήσεις" από το μενού που βρίσκεται στην οθόνης σας και στη συνέχεια "Άμεση απάντηση".',
    },
    {
      title: '5. Αποθήκευση',
      description: 'Επιλέξτε τα κανάλια που θέλετε να ενεργοποιήσετε την άμεση απάντηση. Για να φανεί το κανάλι του Instagram εδώ πρέπει να έχετε συνδέσει την σελίδα του Instagram με αυτή του Facebook. Προσθέστε από κάτω το κείμενο που δημιουργήσαμε για εσάς στην προηγούμενη οθόνη. Τέλος πατήστε το κουμπί "Αποθήκευση".',
    },
  ];
  
  mobileStepsBio = [
    {
      title: '1. Άνοιγμα Εφαρμογής Instagram',
      description: 'Ανοίξτε την εφαρμογή Instagram στη συσκευή σας.'
    },
    {
      title: '2. Προφίλ',
      description: 'Πηγαίνετε στο προφίλ της σελίδας σας πατώντας το εικονίδιο προφίλ στην κάτω δεξιά γωνία.'
    },
    {
      title: '3. Επεξεργασία Προφίλ',
      description: 'Βρείτε και πατήστε το κουμπί "Επεξεργασία Προφίλ" κάτω από τη φωτογραφία προφίλ.'
    },
    {
      title: '4. Επεξεργασία βιογραφικού και συνδέσμου',
      description: 'Στο πεδίο "Βιογραφικό", εισάγετε το κείμενο που σας προτείναμε στην προηγούμενη οθόνη ή εισάγετε κάτι δικό σας με τον online σύνδεσμο κρατήσεων σας που θα βρείτε στο μενού του Fyx. Εισάγετε τον σύνδεσμο online κρατήσεων και στον σύνδεσμο του προφίλ σας.'
    },
    {
      title: '5. Αποθήκευση Αλλαγών',
      description: 'Πατήστε το κουμπί "Ολοκλήρωση" ή "✓" (τσεκ) στην επάνω δεξιά γωνία για να αποθηκεύσετε τις αλλαγές σας.'
    }
];

desktopStepsBio = [
  {
    title: '1. Άνοιγμα Ιστοσελίδας Instagram',
    description: 'Πηγαίνετε στο [Instagram](https://www.instagram.com/) και συνδεθείτε αν δεν είστε ήδη.'
  },
  {
    title: '2. Προφίλ',
    description: 'Κάντε κλικ στην επιλογή "Προφίλ" από το αριστερό menu.'
  },
  {
    title: '3. Επεξεργασία Προφίλ',
    description: 'Κάντε κλικ στο κουμπί “Επεξεργασία Προφίλ” δίπλα στο όνομα χρήστη σας.'
  },
  {
    title: '4. Επεξεργασία βιογραφικού',
    description: 'Εισάγετε ή επεξεργαστείτε το κείμενο του βιογραφικού και εισάγετε το κείμενο που σας προτείναμε στην προηγούμενη οθόνη ή εισάγετε ένα δικό σας με τον σύνδεσμο κρατήσεων σας που θα βρείτε στο βασικό menu του Fyx.'
  },
  {
    title: '5. Υποβολή Αλλαγών',
    description: 'Κάντε κλικ στο “Υποβολή” για να αποθηκεύσετε τις αλλαγές σας.'
  }
];
  guide: any="bio";
  desktopSteps!: any[];
  mobileSteps!: any[];
  desktopVideoUrl!: SafeResourceUrl;
  mobileVideoUrl!: SafeResourceUrl;
  title: string="";



  constructor(private modalController:ModalController,private navParams:NavParams,private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.guide=this.navParams.get('guide')
    this.setGuide(this.guide);
  }


  goBack(){
    this.modalController.dismiss()
  }

  setGuide(guide: string) {
    if (guide === 'greeting') {
      this.desktopSteps = this.desktopStepsGreeting; // array containing the steps for greeting on desktop
      this.mobileSteps = this.mobileStepsGreeting; // array containing the steps for greeting on mobile
      this.desktopVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/MKl-rvtobKY?si=ecHT1szYdqarFJc5');
      this.mobileVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/SVHzh1TtXmE?si=W6iv1p8c_hgSF3lB');
      this.title="Ορισμός αυτόματου χαιρετισμού"
    } else if (guide === 'bio') {
      this.desktopSteps = this.desktopStepsBio; // array containing the steps for bio on desktop
      this.mobileSteps = this.mobileStepsBio; // array containing the steps for bio on mobile
      this.desktopVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/EPyoAfHZ3Bc?si=ynRafDCCTvZnVluJ');
      this.mobileVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/90lHEBB4_Ug?si=WTRzmKuanLKJAqFi');
      this.title="Ορισμός βιογραφικού και συνδέσμου"

    }
  }

}
