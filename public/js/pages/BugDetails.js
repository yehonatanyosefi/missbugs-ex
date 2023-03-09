'use strict'

import { bugService } from '../services/bug.service.js'

export default {
  template: `
    <section v-if="bug" class="bug-details">
      <h1>{{bug.title}}</h1>
      <h4>Description: {{bug.description}}</h4>
      <span :class='"severity" + bug.severity'>Severity: {{bug.severity}}</span>
      <h5>Labels: {{bug.labels}}</h5>
      <h5>Owner: {{bug.owner}}</h5>
      <router-link to="/bug">Back</router-link>
    </section>
    <section v-else class="bug-details">
      <h1>{{err}}</h1>
      <router-link to="/bug">Back</router-link>
    </section>
    `,
  data() {
    return {
      bug: null,
      err: null,
    }
  },
  created() {
    const { bugId } = this.$route.params
    if (bugId) {
      bugService.get(bugId)
        .then((bug) => {
          this.bug = bug
        })
        .catch(err => this.err = err)
    }
  },
}
