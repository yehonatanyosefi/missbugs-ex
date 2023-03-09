'use strict'
import { userService } from "../services/user.service.js"

export default {
  props: ['bug'],
  template: `<article className="bug-preview">
                <span>🐛</span>
                <h4>{{bug.title}}</h4>
                <h5>Description: {{bug.description}}</h5>
                <span :class='"severity" + bug.severity'>Severity: {{bug.severity}}</span>
                <h5>Labels: {{bug.labels}}</h5>
                <h5>Owner: {{bug.owner}}</h5>
                <div class="actions">
                  <router-link :to="'/bug/' + bug._id">Details</router-link>
                  <router-link v-if="isOwner(bug)" :to="'/bug/edit/' + bug._id"> Edit</router-link>
                </div>
                <button v-if="isOwner(bug)" @click="onRemove(bug._id)">X</button>
              </article>`,
  methods: {
    onRemove(bugId) {
      this.$emit('removeBug', bugId)
    },
    isOwner(bug) {
      const user = userService.getLoggedInUser()
      if (!user) return false
      if (user._id !== bug.owner._id && !user.isAdmin) return false
      return true
    },
  },
}
