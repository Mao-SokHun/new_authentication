import {
  validate,
  nonEmptyString,
  optionalNonEmptyString,
  isValidHttpUrl,
} from './validate.js';

function validateCreatePortfolio(req, res) {
  return validate(req, res, {
    required: ['link'],
    custom: (body) => {
      const linkErr = nonEmptyString(body.link, 'link', 500);
      if (linkErr) return linkErr;

      if (!isValidHttpUrl(body.link.trim())) {
        return 'link must be a valid http or https URL';
      }

      if (body.link_tag !== undefined && body.link_tag !== null) {
        const tagErr = optionalNonEmptyString(body.link_tag, 'link_tag', 100);
        if (tagErr) return tagErr;
      }

      return null;
    },
  });
}

function validateUpdatePortfolio(req, res) {
  return validate(req, res, {
    custom: (body) => {
      if (body.link !== undefined) {
        return 'To change the URL, delete this item and create a new one';
      }

      if (body.link_tag === undefined) {
        return 'No fields to update';
      }

      if (body.link_tag === null || body.link_tag === '') {
        return null;
      }

      return optionalNonEmptyString(body.link_tag, 'link_tag', 100);
    },
  });
}

export { validateCreatePortfolio, validateUpdatePortfolio };
