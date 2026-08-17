import { Component } from '@angular/core';
import { Partners } from '../components/partners/partners';
import { Networks } from '../components/networks/networks';
import { RecentEvents } from '../components/recent-events/recent-events';
import { RecentProjects } from '../components/recent-projects/recent-projects';
import { WhyJoinUs } from '../components/why-join-us/why-join-us';
import { Programs } from '../components/programs/programs';
import { Sectors } from '../components/sectors/sectors';
import { Onestop } from '../components/onestop/onestop';
import { Services } from '../components/services/services';
import { Hero } from '../components/hero/hero';
// import { RecentOpportunities } from '../components/recent-opportunities/recent-opportunities';
// import { TopAmbassadors } from '../components/top-ambassadors/top-ambassadors';

@Component({
  selector: 'app-landing',
  imports: [
    RecentProjects,
    RecentEvents,
    // RecentOpportunities,
    Networks,
    Partners,
    WhyJoinUs,
    Programs,
    Sectors,
    Onestop,
    Services,
    Hero
  ],
  templateUrl: './landing.html'
})
export class Landing {}
