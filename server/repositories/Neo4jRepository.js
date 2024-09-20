// File: ./server/repositories/Neo4jRepository.js

import driver from '../config/neo4jConfig.js';
import logger from '../../shared/logger.js';

class Neo4jRepository {

  static async getNodeAndRelationshipTypes() {
    const session = driver.session();
    try {
      logger.debug('Executing Neo4j query for node and relationship types');

      const result = await session.run(`
        CALL {
          MATCH (n)
          RETURN labels(n) AS label, count(n) AS count, false AS isRelationship
        UNION ALL
          MATCH ()-[r]->()
          RETURN type(r) AS label, count(r) AS count, true AS isRelationship
        }
        RETURN label, count, isRelationship
        ORDER BY count DESC
        LIMIT 20
      `);

      const types = result.records.map(record => ({
        name: Array.isArray(record.get('label')) ? record.get('label')[0] : record.get('label'),
        count: record.get('count'), 
        isRelationship: record.get('isRelationship')
      }));
      
      logger.debug(`Retrieved ${types.length} node and relationship types`);
      return types;
    } catch (error) {
      logger.error(`Error in getNodeAndRelationshipTypes: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async getFilteredResults(filters) {
    const session = driver.session();
    try {
      const nodeFilters = filters.filter(f => !f.isRelationship);
      const relFilters = filters.filter(f => f.isRelationship);

      let query = `MATCH (n)`;
      let whereClause = [];

      if (nodeFilters.length > 0) {
        whereClause.push(nodeFilters.map(f => `n:${f.name}`).join(' OR '));
      }

      if (relFilters.length > 0) {
        query += `-[r]->()`;
        whereClause.push(relFilters.map(f => `type(r) = '${f.name}'`).join(' OR '));
      }

      if (whereClause.length > 0) {
        query += ` WHERE ${whereClause.join(' AND ')}`;
      }

      query += `
        RETURN 
          CASE 
            WHEN n.name IS NOT NULL THEN n.name 
            WHEN type(r) IS NOT NULL THEN type(r)
            ELSE null 
          END AS name,
          CASE
            WHEN n IS NOT NULL THEN labels(n)[0]
            WHEN r IS NOT NULL THEN 'relationship'
            ELSE null
          END AS type
        LIMIT 30
      `;

      logger.debug(`Executing Neo4j query: ${query}`);
      const result = await session.run(query);

      return result.records.map(record => ({
        name: record.get('name'),
        type: record.get('type')
      }));
    } catch (error) {
      logger.error(`Error in getFilteredResults: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }


  static async getUpdatedFilterCounts(selectedFilters) {
    const session = driver.session();
    try {
      const query = `
        MATCH (n)
        OPTIONAL MATCH (n)-[r]->()
        WITH labels(n) AS nodeLabels, type(r) AS relType
        UNWIND nodeLabels + [relType] AS label
        WITH label
        WHERE label IS NOT NULL
        RETURN 
          label AS name,
          COUNT(*) AS count,
          CASE WHEN label IN $relTypes THEN true ELSE false END AS isRelationship
      `;

      const relTypes = selectedFilters.filter(f => f.isRelationship).map(f => f.name);
      const result = await session.run(query, { relTypes });

      return result.records.map(record => ({
        name: record.get('name'),
        count: record.get('count').toNumber(),
        isRelationship: record.get('isRelationship')
      }));
    } catch (error) {
      logger.error(`Error in getUpdatedFilterCounts: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async getTags() {
    const session = driver.session();
    try {
      logger.debug('Executing Neo4j query for TopicTags and Tags');

      const result = await session.run(`
        MATCH (t:TopicTag)
        RETURN 'TopicTag' AS tagType, t.name AS name
        UNION ALL
        MATCH (t:Tag)
        RETURN 'Tag' AS tagType, t.name AS name
        ORDER BY name
      `);

      const tags = result.records.map(record => ({
        tagType: record.get('tagType'),
        name: record.get('name')
      }));

      logger.debug(`Retrieved ${tags.length} tags`);
      return tags;
    } catch (error) {
      logger.error(`Error in getTags: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }

  static convertCypherDateToJsDate(cypherDate) {
    const {
      year,
      month,
      day,
      hour,
      minute,
      second,
      nanosecond,
      timeZoneOffsetSeconds
    } = cypherDate;

    const jsDate = new Date(Date.UTC(
      Number(year),
      Number(month) - 1, 
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(nanosecond) / 1e6 // Convert nanoseconds to milliseconds
    ));

    jsDate.setTime(jsDate.getTime() - Number(timeZoneOffsetSeconds) * 1000);

    return jsDate;
  }
}

export default Neo4jRepository;