/* eslint no-empty:0 */
// eslint-disable-next-line ember/no-mixins
import PortMixin from 'ember-debug/mixins/port-mixin';
const Ember = window.Ember;
const { Object: EmberObject } = Ember;
let { libraries } = Ember;

/**
 * Class that handles gathering general information of the inspected app.
 * ex:
 *  - Determines if the app was booted
 *  - Gathers the libraries. Found in the info tab of the inspector.
 *  - Gathers ember-cli configuration information from the meta tags.
 *
 * @module ember-debug/general-debug
 */
export default EmberObject.extend(PortMixin, {
  /**
   * Fetches the ember-cli configuration info and sets them on
   * the `emberCliConfig` property.
   */
  init() {
    this._super(...arguments);
    let found = findMetaTag('name', /environment$/);
    if (found) {
      try {
        let config = JSON.parse(unescape(found.getAttribute('content')));
        this.set('emberCliConfig', config);
      } catch (e) {}
    }
  },

  /**
   * Passed on creation.
   *
   * @type {EmberDebug}
   */
  namespace: null,

  /**
   * Used by the PortMixin
   *
   * @type {String}
   */
  portNamespace: 'general',

  /**
   * Set on creation.
   * Contains ember-cli configuration info.
   *
   * Info used to determine the file paths of an ember-cli app.
   *
   * @return {Object}
   *  {String} environment ex: 'development'
   *  {String} modulePrefix ex: 'my-app'
   *  {String} podModulePrefix ex: 'my-app/pods'
   *  {Boolean} usePodsByDefault
   */
  emberCliConfig: null,

  /**
   * Sends a reply back indicating if the app has been booted.
   *
   * `__inspector__booted` is a property set on the application instance
   * when the ember-debug is inserted into the target app.
   * see: startup-wrapper.
   */
  sendBooted() {
    this.sendMessage('applicationBooted', {
      booted: this.get('namespace.owner.__inspector__booted'),
    });
  },

  /**
   * Sends a reply back indicating that ember-debug has been reset.
   * We need to reset ember-debug to remove state between tests.
   */
  sendReset() {
    this.sendMessage('reset');
  },

  messages: {
    /**
     * Called from the inspector to check if the inspected app has been booted.
     */
    applicationBooted() {
      this.sendBooted();
    },

    /**
     * Called from the inspector to fetch the libraries that are displayed in
     * the info tab.
     */
    getLibraries() {
      this.sendMessage('libraries', { libraries: libraries._registry });
    },

    /**
     * Called from the inspector to refresh the inspected app.
     * Used in case the inspector was opened late and therefore missed capturing
     * all info.
     */
    refresh() {
      window.location.reload();
    },
  },
});

/**
 * Finds a meta tag by searching through a certain meta attribute.
 *
 * @param  {String} attribute
 * @param  {RegExp} regExp
 * @return {Element}
 */
function findMetaTag(attribute, regExp = /.*/) {
  let metas = document.querySelectorAll(`meta[${attribute}]`);
  for (let i = 0; i < metas.length; i++) {
    let match = metas[i].getAttribute(attribute).match(regExp);
    if (match) {
      return metas[i];
    }
  }
  return null;
}